-- Fix: le policy "admin" controllavano profiles.role facendo SELECT dentro profiles,
-- che innesca di nuovo le policy → ricorsione infinita.
-- Soluzione: helper SECURITY DEFINER che bypassa RLS.

-- 1. Drop policy ricorsive
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Admins read leads" on public.leads;
drop policy if exists "Admins read demo codes" on public.demo_codes;

-- 2. Helper: gira come superuser, RLS non si applica
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

-- 3. Ricrea le policy usando la funzione (niente ricorsione)
create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

create policy "Admins read leads"
  on public.leads for select
  using (public.is_admin(auth.uid()));

create policy "Admins read demo codes"
  on public.demo_codes for select
  using (public.is_admin(auth.uid()));
