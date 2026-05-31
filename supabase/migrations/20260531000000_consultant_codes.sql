-- ============================================================
-- Super Consulente : estende demo_codes per l'audit AI gated
-- ============================================================
-- I codici "product" restano monouso (used_at).
-- I codici "consultant" sono multi-uso fino a esaurimento domande:
--   tier (smart/medium/max) → questions_limit → questions_used.
-- Il conteggio domande è SERVER-SIDE (non aggirabile dal browser).

alter table public.demo_codes
  add column if not exists kind text not null default 'product'
    check (kind in ('product', 'consultant')),
  add column if not exists tier text
    check (tier in ('smart', 'medium', 'max')),
  add column if not exists questions_limit integer,
  add column if not exists questions_used integer not null default 0;

-- ------------------------------------------------------------
-- consume_consultant_question
-- Consuma 1 domanda in modo ATOMICO e sicuro.
-- Ritorna una riga con lo stato; ok=false se non valido/esaurito/scaduto.
-- L'API la chiama via supabase.rpc() col service-role.
-- ------------------------------------------------------------
create or replace function public.consume_consultant_question(p_code text)
returns table (
  ok boolean,
  reason text,
  tier text,
  questions_limit integer,
  questions_used integer,
  remaining integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.demo_codes%rowtype;
begin
  -- lock della riga per evitare race su richieste concorrenti
  select * into rec
  from public.demo_codes
  where code = upper(trim(p_code))
  for update;

  if not found then
    return query select false, 'not_found', null::text, null::int, null::int, null::int;
    return;
  end if;

  if rec.kind <> 'consultant' then
    return query select false, 'not_consultant', rec.tier, rec.questions_limit, rec.questions_used, null::int;
    return;
  end if;

  if rec.expires_at < now() then
    return query select false, 'expired', rec.tier, rec.questions_limit, rec.questions_used, 0;
    return;
  end if;

  if rec.questions_used >= coalesce(rec.questions_limit, 0) then
    return query select false, 'exhausted', rec.tier, rec.questions_limit, rec.questions_used,
      0;
    return;
  end if;

  -- consuma una domanda
  update public.demo_codes
  set questions_used = rec.questions_used + 1,
      used_at = coalesce(rec.used_at, now())
  where code = rec.code;

  return query select true, 'ok', rec.tier, rec.questions_limit, rec.questions_used + 1,
    rec.questions_limit - (rec.questions_used + 1);
end;
$$;

revoke all on function public.consume_consultant_question(text) from public;
grant execute on function public.consume_consultant_question(text) to service_role;

-- ------------------------------------------------------------
-- validate_consultant_code
-- Sola lettura: verifica un codice consulente SENZA consumare domande.
-- Usata quando il cliente sblocca il Consulente (mostra tier + domande).
-- ------------------------------------------------------------
create or replace function public.validate_consultant_code(p_code text)
returns table (
  ok boolean,
  reason text,
  tier text,
  questions_limit integer,
  questions_used integer,
  remaining integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.demo_codes%rowtype;
begin
  select * into rec
  from public.demo_codes
  where code = upper(trim(p_code));

  if not found then
    return query select false, 'not_found', null::text, null::int, null::int, null::int;
    return;
  end if;
  if rec.kind <> 'consultant' then
    return query select false, 'not_consultant', rec.tier, rec.questions_limit, rec.questions_used, null::int;
    return;
  end if;
  if rec.expires_at < now() then
    return query select false, 'expired', rec.tier, rec.questions_limit, rec.questions_used, 0;
    return;
  end if;

  return query select true, 'ok', rec.tier, rec.questions_limit, rec.questions_used,
    coalesce(rec.questions_limit, 0) - rec.questions_used;
end;
$$;

revoke all on function public.validate_consultant_code(text) from public;
grant execute on function public.validate_consultant_code(text) to service_role;

-- ------------------------------------------------------------
-- refund_consultant_question
-- Restituisce 1 domanda (se il modello non ha risposto, non la bruciamo).
-- ------------------------------------------------------------
create or replace function public.refund_consultant_question(p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.demo_codes
  set questions_used = greatest(0, questions_used - 1)
  where code = upper(trim(p_code)) and kind = 'consultant';
end;
$$;

revoke all on function public.refund_consultant_question(text) from public;
grant execute on function public.refund_consultant_question(text) to service_role;
