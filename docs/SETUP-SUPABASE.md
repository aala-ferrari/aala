# Setup Supabase per AALA — guida passo per passo

Tempo richiesto: ~10 minuti. Non serve la carta di credito.

---

## 1) Crea l'account e il progetto

1. Apri https://supabase.com → **Start your project**
2. Registrati (consigliato con GitHub, è più veloce — se non hai GitHub, usa email)
3. Una volta dentro, clicca **New project**
4. Compila:
   - **Name**: `aala-portal`
   - **Database password**: clicca "Generate" e **salvati la password** (la userai per backup futuri)
   - **Region**: scegli **Frankfurt (eu-central-1)** o **Milan** se disponibile (più vicino = più veloce)
   - **Pricing plan**: **Free** (sufficiente fino a 500MB DB + 50k utenti)
5. Clicca **Create new project** e aspetta ~2 minuti che si inizializzi

---

## 2) Applica lo schema database

Nel pannello del nuovo progetto:

1. Sidebar sinistra → **SQL Editor** (icona "</>")
2. Clicca **New query**
3. Apri il file `aala/supabase/schema.sql` sul tuo computer, **copia tutto** e incollalo
4. Clicca **Run** (in basso a destra, o `⌘+Enter`)
5. Dovresti vedere "Success. No rows returned" — perfetto

Questo crea: `profiles`, `products`, `orders`, `subscriptions`, `leads`, `demo_codes` con tutte le policy di sicurezza.

---

## 3) Prendi le chiavi API

Sidebar → **Project Settings** (icona ingranaggio in basso) → **API**

Ti serviranno **3 valori** da copiare nel file `aala/.env.local`:

| Valore in Supabase | Nome variabile | Cosa fa |
|---|---|---|
| **Project URL** (sopra) | `NEXT_PUBLIC_SUPABASE_URL` | URL del tuo progetto |
| **Project API keys → anon public** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chiave usata dal browser (sicura) |
| **Project API keys → service_role secret** | `SUPABASE_SERVICE_ROLE_KEY` | Chiave segreta per i server (**MAI nel browser**) |

Apri `aala/.env.local` e incolla i 3 valori al posto dei placeholder.

---

## 4) Riavvia il server

Nel terminale dove gira `npm run dev`, premi `Ctrl+C` per fermarlo, poi:
```bash
npm run dev
```
Le nuove env var vengono lette solo al riavvio.

---

## 5) Crea il PRIMO admin (chicken-and-egg)

C'è un problema logico: **per creare un admin dall'admin panel, devi essere già admin**. Ecco come uscire dall'imbrigliata, scegli uno dei due metodi:

### Metodo A — Self-signup + promozione SQL (consigliato)

1. Apri http://localhost:3000/it/signup
2. Crea un account con la tua email reale + password
3. Torna su Supabase Dashboard → **Table Editor** → tabella **`profiles`**
4. Trovi la tua riga, fai click sulla colonna `role` (valore: `user`)
5. Cambia in `admin` → premi `Enter` → salvato
6. Ricarica http://localhost:3000/it/admin → ora vedi il backoffice ✅

### Metodo B — Crea direttamente via Supabase Auth

1. Supabase Dashboard → **Authentication** → **Users** → **Add user → Create new user**
2. Email + password (spunta "Auto Confirm User" per saltare la verifica)
3. Vai in **Table Editor → profiles** e cambia `role` a `admin` come sopra
4. Login su http://localhost:3000/it/login

---

## 6) Da qui in poi tutto funziona dal pannello

Una volta che sei admin, ogni altro utente lo puoi creare da `/it/admin/users` con il bottone **"Crea utente"**:

- **Modalità "Invia invito"** → Supabase manda email con link per impostare password (richiede SMTP — vedi nota sotto)
- **Modalità "Imposta password"** → tu scegli email + password, l'utente accede subito (le credenziali ti vengono mostrate una volta sola, da copiare e mandare via WhatsApp)

> **Nota SMTP per la modalità "Invia invito"**: di default Supabase usa un SMTP gratuito limitato (4 email/ora). Per produzione collega un provider serio in **Project Settings → Auth → SMTP Settings**. Il più semplice è usare le stesse credenziali di Resend.

---

## 7) Email codici demo — facoltativo, attivalo quando vuoi

Quando approvi un lead da `/admin/leads`, il sistema può inviare un'email automatica col codice di accesso. Serve un account Resend:

1. https://resend.com → registrati gratis (3000 email/mese)
2. **API Keys** → **Create API key** → copia
3. Aggiungi in `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxx
   RESEND_FROM_EMAIL=AALA <onboarding@resend.dev>
   ```
4. Riavvia `npm run dev`

Quando avrai il dominio (es. `aala.com`), su Resend → **Domains** → aggiungilo, copia i 3 record DNS richiesti, e cambia il from in `noreply@aala.com`.

**Se non configuri Resend**: nessun problema, il codice viene comunque generato e mostrato nel pannello admin per invio manuale.

---

## Diagnostica veloce

| Problema | Causa probabile | Soluzione |
|---|---|---|
| `/it/admin` fa loop su `/login` | Non sei autenticato | Login con un utente |
| `/it/admin` ti redirige a `/account` | Non sei admin | Promuovi via SQL (passo 5) |
| `/it/signup` non crea l'utente | Env var Supabase mancanti o sbagliate | Controlla `.env.local`, riavvia `npm run dev` |
| "Codice non valido" su `/demo` | Codice scaduto o già usato | Genera un nuovo codice dal pannello |
| Email non parte | Resend non configurato | Vedi punto 7 — il codice resta visibile nel pannello per invio manuale |
