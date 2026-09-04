-- Tessera dell'ordine allegata al modulo «Provoje tani» (superavokati.ai).
-- Il file vive su disco (/opt/aala-tessere, fuori dal repo); qui solo il nome.
alter table public.leads add column if not exists tessera_file text;
