-- Esito della verifica AI della tessera (JSON dal cervello Super Avokati):
-- eshte_tesere, profesioni, emri, numri, leshuar_nga, duket_si, konfidenca.
alter table public.leads add column if not exists tessera_check text;
