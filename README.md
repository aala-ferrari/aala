# Albania Auto Legal Alliance (AALA)

Portale ombrello che unifica, vende e instrada verso i 4 prodotti verticali:
- **Auto** — gestionale rent-a-car
- **CRM Medical** — CRM per studi medici
- **Legal** (Super Avocati) — applicazione legale SaaS
- **Dental** — agenzia turismo dentale

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Framer Motion
- Three.js / React Three Fiber (aurora 3D)
- Supabase (Postgres + Auth)
- Stripe (subscriptions + one-shot)
- i18n: IT / EN / ES / FR / DE (next-intl)
- Deploy: Vercel

## Avvio locale

```bash
# 1. installa Node 20+ (https://nodejs.org) e poi:
npm install

# 2. copia env e compila le chiavi
cp .env.example .env.local

# 3. dev server
npm run dev
```

Aperto su http://localhost:3000

## Struttura

```
src/
  app/
    [locale]/            pagine pubbliche (home, servizi, prezzi, ecc)
    account/             area cliente protetta
    admin/               backoffice
    api/                 route API (stripe, sso, leads)
  components/            componenti riutilizzabili (UI, 3D, sezioni)
  lib/                   client supabase, stripe, helpers
  messages/              file traduzioni per lingua
  i18n.ts                config next-intl
```
