# Cosa è pronto e cosa manca

## ✅ Pronto in questa prima sessione

### Vetrina pubblica
- Home con hero 3D aurora boreale (WebGL shader), sezione 4 servizi, valori, CTA
- 4 pagine servizio dinamiche (CRM Medical, Auto, Legal, Dental) con prezzi
- Pagina prezzi aggregata
- Chi siamo, contatti (form funzionante con API), pagine legali (placeholder)
- Footer + nav responsive con menu mobile
- i18n IT / EN / ES / FR / DE già configurato (tutte le stringhe della home tradotte)

### Backend / dati
- Schema Supabase completo (`supabase/schema.sql`): profiles, products, orders, subscriptions, leads, con RLS
- Client Supabase browser + server + service-role
- API routes: `/api/leads`, `/api/checkout`, `/api/stripe/webhook`, `/api/sso/[product]`
- JWT signer integrato (HS256) per il SSO senza dipendenze esterne

### Auth / commerce
- Pagine `/login` e `/signup` con Supabase Auth
- Area cliente `/account` (mostra prodotti attivi + abbonamenti + ordini + bottone SSO ai prodotti)
- Backoffice `/admin` (KPI base — utenti, ordini, abbonamenti, lead, fatturato)
- Flusso checkout Stripe completo (one-shot + subscriptions) con webhook sync

### SEO / qualità
- `sitemap.xml` multilingua + `robots.txt` automatici
- Pagina 404 brandizzata
- Font display (Fraunces) + sans (Inter) caricati ottimizzati
- Animazioni Framer Motion allo scroll
- Fallback statico per dispositivi con poca memoria / reduced motion

## ⚠️ Da fare prima del lancio (operazioni utente)

1. **Installare Node.js** sul Mac (vedi SETUP.md)
2. **`npm install`** dentro la cartella `aala`
3. **Creare account Supabase** + applicare `supabase/schema.sql`
4. **Creare account Stripe**
5. **Compilare `.env.local`** con tutte le chiavi
6. **Generare `AALA_SSO_SECRET`** con `openssl rand -hex 64`
7. **Modificare i 4 prodotti** per accettare il token SSO (vedi `docs/SSO.md`)
8. **Registrare dominio** (es. `aala.com` o `albania-ala.com`)
9. **Deploy su Vercel**

## 🔜 Iterazioni successive (codice da scrivere)

### Priorità 1 — fondamentali
- [ ] **Reset password** + email verification (Supabase fa quasi tutto, manca solo UI)
- [ ] **Customer Portal Stripe** dentro /account (gestione metodi pagamento, fatture, cancellazione)
- [ ] **Pagine legali vere** (privacy, termini, cookie) redatte da legale
- [ ] **Banner cookie GDPR**
- [ ] **Traduzioni complete** per le pagine servizio (ora i testi prodotti sono solo in italiano in `lib/products.ts`)

### Priorità 2 — admin completo
- [ ] Tabelle CRUD nel `/admin`: clienti, ordini, abbonamenti, lead
- [ ] Pipeline lead (stato → contattato → qualificato → won/lost)
- [ ] Export CSV
- [ ] Notifiche email su nuovo lead (Resend, Postmark o SES)

### Priorità 3 — visivo extra
- [ ] **Splash transition** WebGL tra una pagina servizio e l'altra (effetto "veil")
- [ ] Card 3D che ruotano sul mouse hover nella sezione Servizi
- [ ] Cursore custom con scia
- [ ] Sezione testimonial + carosello loghi clienti
- [ ] Pagina case study per ogni verticale

### Priorità 4 — app nativa
- [ ] Wrapping con Capacitor (iOS + Android)
- [ ] PWA manifest + service worker
- [ ] Notifiche push
