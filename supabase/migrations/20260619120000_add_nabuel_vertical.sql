-- ============================================================
-- 'nabuel' è il 6° verticale (agente vocale AI), aggiunto dopo lo schema:
-- i vincoli CHECK su `vertical` non lo includevano → l'insert di un codice
-- demo (o prodotto) nabuel falliva con demo_codes_vertical_check.
-- Stesso identico pattern usato per 'taxi' (5° verticale).
-- ============================================================

alter table public.demo_codes drop constraint if exists demo_codes_vertical_check;
alter table public.demo_codes
  add constraint demo_codes_vertical_check
  check (vertical in ('medical', 'auto', 'legal', 'dental', 'taxi', 'nabuel'));

alter table public.products drop constraint if exists products_vertical_check;
alter table public.products
  add constraint products_vertical_check
  check (vertical in ('medical', 'auto', 'legal', 'dental', 'taxi', 'nabuel'));
