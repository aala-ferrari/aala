-- ============================================================
-- Il catalogo dei piani è la fonte di verità in CODICE (src/lib/products.ts),
-- non la tabella public.products (che resta solo informativa/futura).
-- La FK orders.product_id → products(id) bloccava la creazione di ordini per
-- piani non ancora "seedati" nel DB (es. nabuel-starter), rompendo sia il
-- checkout con carta (webhook) sia l'ordine assistito.
-- product_id diventa un riferimento logico (text libero) al piano in codice.
-- ============================================================

alter table public.orders drop constraint if exists orders_product_id_fkey;
alter table public.subscriptions drop constraint if exists subscriptions_product_id_fkey;
