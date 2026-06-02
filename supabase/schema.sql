-- AALA database schema
-- Apply this in Supabase SQL editor after creating the project.

-- ============================================================
-- profiles : extends auth.users with app-level fields
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  company text,
  phone text,
  locale text default 'it',
  role text not null default 'user' check (role in ('user', 'admin')),
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Helper SECURITY DEFINER per evitare ricorsione nelle policy admin.
-- Senza questo, una policy che fa SELECT su profiles riinnescherebbe
-- le policy di profiles → infinite recursion.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  )
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated, anon, service_role;

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

-- auto-create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- products : catalog of all sellable plans
-- ============================================================
create table if not exists public.products (
  id text primary key,                -- e.g. 'crm-medical-starter'
  vertical text not null check (vertical in ('medical', 'auto', 'legal', 'dental')),
  name text not null,
  billing text not null check (billing in ('one-time', 'monthly', 'yearly', 'contact')),
  price_eur integer not null default 0,
  stripe_price_id text,
  active boolean not null default true,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can read active products"
  on public.products for select
  using (active = true);

-- ============================================================
-- orders : one-time purchases (CRMs custom)
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  product_id text references public.products(id),
  stripe_session_id text unique,
  stripe_payment_intent text,
  amount_eur integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'fulfilled', 'refunded', 'failed')),
  metadata jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.orders enable row level security;

create policy "Users see their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- ============================================================
-- subscriptions : Stripe subscriptions sync
-- ============================================================
create table if not exists public.subscriptions (
  id text primary key,                -- stripe sub id
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text references public.products(id),
  vertical text not null,
  status text not null,               -- active, trialing, past_due, canceled, ...
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users see their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ============================================================
-- leads : contact form, dental tourism inquiries
-- ============================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  service text,                       -- 'medical' | 'auto' | 'legal' | 'dental' | 'other'
  message text not null,
  source text,                        -- 'contact-form' | 'dental-form' | ...
  locale text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'won', 'lost')),
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- only admins read leads; anonymous insert via service role from API route
create policy "Admins read leads"
  on public.leads for select
  using (public.is_admin(auth.uid()));

-- ============================================================
-- demo_codes : codici di accesso demo generati dall'admin
-- ============================================================
create table if not exists public.demo_codes (
  code text primary key,                              -- es. 'LEG-A4F8B2'
  vertical text not null check (vertical in ('medical', 'auto', 'legal', 'dental', 'taxi')),
  lead_id uuid references public.leads(id) on delete set null,
  email text,                                         -- copia per audit
  created_by uuid references public.profiles(id),     -- admin che ha approvato
  used_at timestamptz,                                -- null = mai usato
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  -- Super Consulente (audit AI gated): vedi migration 20260531000000
  kind text not null default 'product'
    check (kind in ('product', 'consultant')),
  tier text check (tier in ('smart', 'medium', 'max')),
  questions_limit integer,                            -- domande totali (solo consultant)
  questions_used integer not null default 0           -- contatore server-side
);

create index if not exists demo_codes_lead_idx on public.demo_codes(lead_id);
create index if not exists demo_codes_email_idx on public.demo_codes(email);

alter table public.demo_codes enable row level security;

-- nessuna lettura dal browser — l'API usa service-role
create policy "Admins read demo codes"
  on public.demo_codes for select
  using (public.is_admin(auth.uid()));

-- ============================================================
-- updated_at trigger helper
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute procedure public.touch_updated_at();

drop trigger if exists subs_touch on public.subscriptions;
create trigger subs_touch before update on public.subscriptions
  for each row execute procedure public.touch_updated_at();
