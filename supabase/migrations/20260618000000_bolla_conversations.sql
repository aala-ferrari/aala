-- Persistent conversation memory for the Bolla AI assistant.
-- Anonymous visitors don't get persistence (per UX/privacy choice);
-- only authenticated users have their chat history saved across sessions
-- so when they reopen the Bolla weeks later it "remembers" them.

create table if not exists public.bolla_conversations (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  -- chat history as JSONB array: [{ role:'user'|'assistant', content:string, ts:string }]
  messages         jsonb not null default '[]'::jsonb,
  -- last service the AI converged on — useful for analytics and for the WhatsApp link
  last_service     text,
  -- last AI-generated WhatsApp pre-fill — so even silent reopens keep the latest summary
  whatsapp_message text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.bolla_conversations enable row level security;

-- A user can only read/write their own conversation. Service role bypasses
-- RLS entirely (used by the API to upsert from the bolla endpoint).
create policy "Users read own bolla conv"
  on public.bolla_conversations for select
  using (auth.uid() = user_id);

create policy "Users write own bolla conv"
  on public.bolla_conversations for insert
  with check (auth.uid() = user_id);

create policy "Users update own bolla conv"
  on public.bolla_conversations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own bolla conv"
  on public.bolla_conversations for delete
  using (auth.uid() = user_id);

-- Keep updated_at in sync automatically.
create or replace function public.touch_bolla_conv_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_bolla_conv on public.bolla_conversations;
create trigger trg_touch_bolla_conv
  before update on public.bolla_conversations
  for each row execute function public.touch_bolla_conv_updated_at();
