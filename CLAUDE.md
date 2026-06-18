# AALA — Albania Auto Legal Alliance · istruzioni di progetto

Portale "ombrello" che vende e instrada verso 5 prodotti verticali. Vetrina di lusso + hub commerciale + assistente AI. Non rifà i prodotti: li mostra e li vende.

## Stack
- **Next.js 14** (App Router) + TypeScript + Tailwind + Framer Motion
- **React Three Fiber / Three.js** per le scene 3D
- **next-intl 3.26** — i18n in 6 lingue: `it · en · es · fr · de · sq`
- **Supabase** (Postgres + Auth) — progetto cloud "Aala"
- **Stripe** (subscriptions + one-shot) · **Resend** (email codici demo)
- Avvio: `npm run dev` → :3000. Node 20+. `.env.local` NON versionato (chiavi vere).

## Identità visiva (NON cambiare senza chiedere)
Palette **cream + oro + navy** (mai dark/nero). Cuore visivo = la **"bolla di Zhiva"**: sfera 3D dorata morphante (`MeshDistortMaterial`). Look "azienda multi-milionaria" tipo Patek/Rimowa. Niente effetti freddi/cyber/aurora.
- Illuminazione bolla = morbida (no spotlight forti che appiattiscono il morphing)
- Hero = layout split: testo a sinistra, bolla a destra (mai testo sopra la bolla)

## Struttura
```
src/
  app/[locale]/        pagine pubbliche (home, servizi/[slug], prezzi, demo, account, admin, ...)
  app/api/             bolla, leads, checkout, stripe/webhook, sso, admin, demo/redeem
  components/
    3d/                LuxuryScene (bolla hero), GoldenGlobe (Valori), Orrery (CTA), HeroBolla
    bolla/             la Bolla parlante (assistente AI) — vedi sotto
    sections/ layout/ mockups/ ui/
  lib/                 products.ts (5 verticali + prezzi), bolla-brain.ts, supabase, stripe, email
  messages/            it/en/es/fr/de/sq .json
```

## I 5 servizi (`src/lib/products.ts`)
medical (CRM+webpages, teal) · auto (ambra) · legal=Super Avokati (oro) · dental (verde) · taxi (giallo). Ogni vertical ha hero, features, plans. Prezzi: vedi memoria progetto.

## 🫧 La Bolla parlante (feature distintiva)
Assistente AI conversazionale, cervello **Claude Opus 4.8**. Vedi `src/app/api/bolla/route.ts`:
3 backend a cascata → Anthropic API · **Claude Code CLI** (subscription, gratis, attivo in locale) · regole (`lib/bolla-brain.ts`, fallback).
- Risponde nella lingua dell'utente (client passa `locale`)
- Cambia colore per servizio; per demo/preventivi manda su **WhatsApp** (+355699555777) col contesto pronto
- Componenti in `components/bolla/`: BollaScene3D (3D reattiva), BollaAssistant (pannello, apre a SINISTRA su desktop), BollaLauncher (pulsante oro pulsante in basso a sx; WhatsApp FAB a dx)

### 🔒 Riservatezza tecnologica (regola dura, non rimuovere)
Bolla e Super Consulente NON devono MAI rivelare il modello/vendor che girano sotto il cofano (no "Claude", "Opus", "Anthropic", "GPT", "OpenAI", "Sonnet", "Gemini", "Mistral"). Si presentano come "tecnologia AI proprietaria di AALA". È vantaggio competitivo + lock-in: il cliente non deve poter replicare lo stack chiedendolo alla Bolla. La regola è hard-coded nel SYSTEM_PROMPT di `api/bolla/route.ts` e `api/consulente/route.ts` — se aggiungi un nuovo endpoint AI customer-facing, replica la stessa clausola.

## Versioning
Git con tag progressivi `v1`→`v5`. `git checkout vN` per tornare indietro. Salvare con commit quando l'utente lo chiede; taggare i milestone.

## Prodotti collegati (locali, vanno riavviati dopo reboot)
CRM Medical :4002 · Auto :4001+:4011 · Super Avokati :5050 · dental = medicalalbania.com. URL in `.env.local` (`URL_PRODUCT_*`) + `LIVE_PRODUCT_URL` in redeem/showcase.

## Stile di lavoro col cliente
Si rivolge come "fratello/maestro" — proporre con visione, non solo eseguire. Tono caldo e diretto. Cura maniacale dei dettagli visivi. Verificare i cambi nel browser quando possibile.
