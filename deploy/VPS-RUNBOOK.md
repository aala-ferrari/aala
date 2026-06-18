# VPS Runbook — Contabo (31.220.90.246)

Operatività del server che ospita tutto il portfolio Romeo / AALA.
Manuale di emergenza: se qualcosa è rotto, partire da qui.

---

## 0. Accesso

- **IP:** 31.220.90.246
- **User:** root
- **Auth:** SSH key (preferito) oppure password (vedi gestore credenziali personale — NON in chiaro qui)
- **Shell rapida dal Mac:** `ssh root@31.220.90.246`
- **Specs:** Contabo Cloud VPS — 12 GB RAM, AMD EPYC con AVX2 (richiesto per numpy/Claude CLI), Ubuntu 24.04 LTS, UFW attivo (22/80/443 aperti).

---

## 1. Cosa gira sul server (mappa mentale)

### Processi PM2 (Node)

| App | Porta interna | Dominio pubblico | Path | Stack |
|---|---|---|---|---|
| `aala` | 3000 | https://aala.global | `/var/www/apps/aala` | Next.js 14 |
| `auto` | 3001 | https://auto.aala.global | `/var/www/apps/auto/web` | Next.js |
| `crm-medical` | 3002 | https://crm.aala.global | `/var/www/apps/crm-medical` | Next.js |
| `taxi-admin` | 3003 | https://taxi.aala.global | `/var/www/apps/taxi/admin-web` | Next.js |
| `taxi-backend` | 4000 | https://api.taxi.aala.global | `/var/www/apps/taxi/backend` | Fastify |
| `tts-server` | 5005 | (solo localhost) | `/opt/tts-server` | Python VITS MMS-TTS Meta — voce albanese |

### Container Docker

| Container | Porta | Cosa | Persistence |
|---|---|---|---|
| `super-avvocato` | 5050 | Flask + Postgres legalkb | `/var/www/apps/super-avvocato/data` mount |
| `taxi_postgres` | 5432 | Postgres+PostGIS DB taxi | volume named |
| `taxi_redis` | 6379 | Cache taxi | volume named |

### Reverse proxy

`nginx` ascolta su 80/443, vhost per ogni dominio in `/etc/nginx/sites-enabled/`. SSL Let's Encrypt in `/etc/letsencrypt/live/<dominio>/`, auto-rinnovo via cron certbot di sistema (`systemctl status certbot.timer`).

---

## 2. Dove sono le chiavi / segreti

| File | Cosa contiene |
|---|---|
| `/var/www/apps/aala/.env.local` | Supabase, Stripe, Resend, URL_PRODUCT_* per SSO/demo |
| `/var/www/apps/auto/web/.env.local` | env auto |
| `/var/www/apps/crm-medical/.env` | env CRM |
| `/var/www/apps/taxi/backend/.env` | DATABASE_URL postgres, JWT_SECRET, Traccar |
| `/var/www/apps/taxi/admin-web/.env.local` | URL API backend |
| `/opt/claude-creds/.credentials.json` | OAuth Claude (chown 1000:1000, mount sub super-avvocato `/home/avvocato/.claude:ro`) |
| `/root/.claude/.credentials.json` | OAuth Claude per processi root (aala bolla, taxi assistant) |
| `/etc/letsencrypt/live/*` | Cert SSL (privkey + fullchain) |
| `~/.ssh/authorized_keys` | Le chiavi SSH ammesse |

**Backup `.env`**: PRIMA di toccarne uno, sempre:
`cp /var/www/apps/<x>/.env.local /var/www/apps/<x>/.env.local.bak-$(date +%Y%m%d-%H%M%S)`

---

## 3. Restart / deploy

### Restart singolo processo Node
```bash
pm2 restart aala            # solo aala
pm2 restart all             # tutto Node
pm2 logs aala --lines 50    # log live (Ctrl+C per uscire)
pm2 logs aala --nostream    # log statico (ultimi 15 righe)
pm2 logs aala --err         # solo stderr
pm2 list                    # stato + porte + uptime
```

### Restart container Docker
```bash
docker ps                                # quali girano
docker restart super-avvocato            # ricrea senza ricostruire
docker logs super-avvocato --tail 50     # log
docker logs -f super-avvocato            # tailing live
```

### Deploy nuovo codice (esempio aala)
```bash
# Dal Mac, copia file modificati:
rsync -az ~/Desktop/multi\ service/aala/src/ root@31.220.90.246:/var/www/apps/aala/src/

# Sul VPS:
cd /var/www/apps/aala
npm run build      # rebuild Next
pm2 restart aala   # ricarica
pm2 logs aala --lines 20 --nostream    # verifica boot pulito
```

Per super-avvocato (Docker):
```bash
cd /var/www/apps/super-avvocato
docker build -t super-avvocato:v9.3 .
docker stop super-avvocato && docker rm super-avvocato
docker run -d --name super-avvocato --restart unless-stopped -p 5050:5050 \
  -v /var/www/apps/super-avvocato/data:/app/data \
  -v /opt/claude-creds:/home/avvocato/.claude:ro \
  -e BRAIN_BACKEND=claude_code \
  super-avvocato:v9.3
```

### Restart nginx (raro)
```bash
nginx -t                          # verifica config (SEMPRE prima di reload)
systemctl reload nginx            # zero-downtime
systemctl restart nginx           # solo se reload non basta
```

---

## 4. SSL — emettere / rinnovare un certificato

Già automatizzato: certbot rinnova in autonomia. Per emettere un nuovo cert (es. nuovo dominio):

```bash
# 1) DNS: A record nuovo-dominio → 31.220.90.246, aspetta propagazione
# 2) Nginx vhost in /etc/nginx/sites-enabled/<nuovo-dominio> (versione HTTP)
# 3) Emetti cert + abilita HTTPS + redirect 80→443
certbot --nginx -d nuovo-dominio -d www.nuovo-dominio \
        --non-interactive --agree-tos -m giovannibaglioo@libero.it --redirect

# Verifica auto-rinnovo:
certbot renew --dry-run
systemctl status certbot.timer
```

---

## 5. Database

### Taxi (Postgres in container)
```bash
docker exec -it taxi_postgres psql -U taxi -d taxi
# Connection string: postgres://taxi:taxi_dev_password@localhost:5432/taxi
# Migrazioni Drizzle: cd /var/www/apps/taxi/backend && npm run migrate
```

### Super-Avvocato (SQLite + Postgres legalkb)
```bash
# SQLite app.db dentro al container, persistente via mount /var/www/apps/super-avvocato/data
# Per ispezione:
docker exec -it super-avvocato python -c "import sqlite3; c=sqlite3.connect('/app/data/app.db'); [print(r) for r in c.execute('SELECT name FROM sqlite_master WHERE type=\"table\"')]"
```

### Supabase (cloud, project "Aala")
- Dashboard: https://supabase.com/dashboard/project/hvivkxyhcbkaytvkbswv
- SQL editor: aggiungi qui le migrazioni di `aala/supabase/migrations/`
- Auth keys in `aala/.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)

---

## 6. Monitoring rapido

```bash
# Stato globale in 5 secondi
pm2 list && docker ps --format 'table {{.Names}}\t{{.Status}}'

# Health-check di tutti i domini
for h in aala.global superavokati.ai auto.aala.global crm.aala.global taxi.aala.global api.taxi.aala.global; do
  printf "%-35s %s\n" "$h" "$(curl -s -o /dev/null -w '%{http_code}' https://$h/)"
done

# Risorse VPS
free -h && df -h | grep -v tmpfs && uptime

# Log centralizzato delle ultime 50 righe per ogni Node app
pm2 logs --nostream --lines 30
```

---

## 7. Claude CLI (subscription, no API key)

Tre app dipendono dalla CLI Claude per il "cervello AI":
- **AALA bolla / consulente** → spawn `claude` come root, usa `/root/.claude/.credentials.json`
- **Taxi owner assistant** → uguale
- **Super-Avvocato** → user `avvocato` nel container, monta `/opt/claude-creds`

Verifica funzionante:
```bash
# Test diretto come root
claude -p 'Rispondi: OK' --output-format text

# Test dentro al container Super-Avvocato
docker exec super-avvocato claude -p 'OK' --output-format text
```

Se "credentials not found" o "Please run /login":
```bash
# Le credenziali OAuth scadono mai? Sì, ogni ~90gg.
# Per rigenerarle (dal MAC, perché serve un browser):
# 1. claude login (sul Mac)
# 2. Copia ~/.claude/.credentials.json
# 3. scp -O al VPS:
#    scp ~/.claude/.credentials.json root@31.220.90.246:/root/.claude/.credentials.json
#    scp ~/.claude/.credentials.json root@31.220.90.246:/opt/claude-creds/.credentials.json
# 4. Sul VPS: chown 1000:1000 /opt/claude-creds/.credentials.json
```

---

## 8. Backup (manuale per ora — TODO automatizzare)

```bash
# Snapshot env files
tar czf ~/env-backup-$(date +%F).tgz \
    /var/www/apps/*/.env* \
    /opt/claude-creds /root/.claude

# Dump Postgres taxi
docker exec taxi_postgres pg_dump -U taxi taxi | gzip > ~/taxi-db-$(date +%F).sql.gz

# Dump SQLite super-avvocato
cp /var/www/apps/super-avvocato/data/app.db ~/superavocati-db-$(date +%F).db
```

Trasferire i backup sul Mac dopo (`scp root@31.220.90.246:~/env-backup-*.tgz ~/backups/`).

---

## 9. Troubleshooting comune

| Sintomo | Probabile causa | Fix rapido |
|---|---|---|
| `https://X` → 502 Bad Gateway | App Node morta | `pm2 restart X` + `pm2 logs X` |
| `https://X` → 404 nginx | vhost manca o symlink rotto | `ls /etc/nginx/sites-enabled/` |
| SSL "non valido" | Cert scaduto | `certbot renew --force-renewal -d X` |
| Build Next fallisce per memoria | OOM | `NODE_OPTIONS='--max-old-space-size=2048' npm run build` |
| Container Docker exited | Volume rotto o env mancante | `docker logs <name> --tail 50` |
| Bolla risponde con fallback (rules) | Claude CLI bloccato | Test `claude -p test` come root |
| Briefing taxi 8:00 non appare | Scheduler morto / nessun dato | `pm2 logs taxi-backend | grep briefing` |
| Disco pieno | Log PM2 cresciuti | `pm2 flush` (svuota log) o ruota cron |
| Voce albanese suona piatta | tts-server giù → fallback Google | `pm2 restart tts-server` e `curl -s -o /tmp/x.wav -X POST http://127.0.0.1:5005/tts -H "Content-Type: application/json" -d '{"text":"test","locale":"sq"}' -w "%{http_code}\n"` |

---

## 10. DNS

Dominio principale `aala.global` su **Namecheap** (Advanced DNS):
- `@` A → 31.220.90.246
- `www` CNAME → aala.global
- `auto` A → 31.220.90.246
- `crm` A → 31.220.90.246
- `taxi` A → 31.220.90.246
- `api.taxi` A → 31.220.90.246
- TXT `privateemail._d...` → DKIM (email info@aala.global su Namecheap Private Email — NON TOCCARE)

Dominio `superavokati.ai`: stesso Namecheap, `@` A → 31.220.90.246.

---

## 11. Contatti utili

- **Hosting VPS**: Contabo — https://my.contabo.com (account Romeo)
- **DNS / Email**: Namecheap — https://ap.www.namecheap.com
- **Supabase (DB AALA)**: https://supabase.com/dashboard/project/hvivkxyhcbkaytvkbswv
- **Stripe**: https://dashboard.stripe.com
- **Resend (email da app)**: https://resend.com/emails
- **GitHub repos**: aala-ferrari/aala, aala-ferrari/taxi, aala-ferrari/super-avvocato, aala-ferrari/auto, aala-ferrari/crm-medical

---

*Ultimo aggiornamento: 2026-06-19. Tieni sincronizzato sia su `/root/VPS-RUNBOOK.md` (server) sia in repo `aala/deploy/VPS-RUNBOOK.md` (Mac/GitHub).*
