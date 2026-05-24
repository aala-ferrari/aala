# Avvio AALA — guida passo per passo

Tutto il codice è già pronto. Mancano solo Node.js, le chiavi di Supabase/Stripe e un dominio.

## 1. Installa gli strumenti base (una volta sola)

```bash
# Xcode Command Line Tools (per git)
xcode-select --install

# Node.js LTS (consiglio: nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# riavvia il terminale, poi:
nvm install 20
nvm use 20
node -v   # deve dire v20.x.x
```

## 2. Installa le dipendenze del progetto

```bash
cd "/Users/aldo/Desktop/multi service/aala"
npm install
```

Pazienza, scarica ~400 MB di node_modules. Solo la prima volta.

## 3. Crea il progetto Supabase

1. Vai su https://supabase.com e crea un nuovo progetto (free tier basta per iniziare).
2. Apri **SQL Editor** → incolla tutto il contenuto di `supabase/schema.sql` → **Run**.
3. Apri **Project Settings → API**, copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

## 4. Crea l'account Stripe

1. Vai su https://stripe.com e attiva l'account (modalità test va benissimo).
2. **Developers → API keys**, copia:
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → `STRIPE_SECRET_KEY`
3. **Developers → Webhooks**, ti serve dopo (vedi sezione 7).

## 5. Compila `.env.local`

```bash
cp .env.example .env.local
# poi apri .env.local e incolla i valori
```

Genera anche il segreto SSO:
```bash
openssl rand -hex 64
# incollalo come AALA_SSO_SECRET
```

## 6. Lancia il dev server

```bash
npm run dev
```

Apri http://localhost:3000 → vedi la home con aurora boreale.

## 7. Webhook Stripe in locale

In un altro terminale, una volta sola installa Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
stripe login
```

Poi avvia il forward verso il webhook locale:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copia il `whsec_...` che stampa → mettilo come STRIPE_WEBHOOK_SECRET
# riavvia npm run dev
```

## 8. Crea il primo utente admin

1. Vai su http://localhost:3000/it/signup e registrati.
2. In Supabase → **Table Editor → profiles**, trova la tua riga e cambia `role` da `user` a `admin`.
3. Ora vedi `/it/admin`.

## 9. Deploy su Vercel

1. Crea un repo Git e push.
2. Vai su https://vercel.com → New Project → importa il repo.
3. Imposta tutte le env var (gli stessi valori di `.env.local` ma con dominio production).
4. Aggiungi il dominio custom quando lo registri.
5. Su Stripe → Webhooks, crea un endpoint production che punta a `https://<dominio>/api/stripe/webhook` e aggiorna `STRIPE_WEBHOOK_SECRET` su Vercel.

## 10. Integrazione SSO con i prodotti

Vedi `docs/SSO.md` per le modifiche da fare a:
- `auto/backend`
- `crm medical`
- `Super Avocati`
- `dental-tourism`

Ognuno deve esporre `/sso/aala?aala_token=...` e usare lo stesso `AALA_SSO_SECRET`.
