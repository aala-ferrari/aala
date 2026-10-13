# Script operativi del VPS

Copia versionata di quello che gira su `root@31.220.90.246`. **L'originale è
sul VPS**: qui c'è per non perderlo e per poterne leggere la storia.

| file | dove sta sul VPS | quando gira |
|---|---|---|
| `uptime-monitor.sh` | `/opt/uptime-monitor.sh` | cron `*/5 * * * *` |
| `backup-aala.sh` | `/opt/backup-aala.sh` | cron `30 3 * * *` |
| `permessi-dati.sh` | `/root/permessi-dati.sh` | a mano, **dopo ogni ripristino** |
| `ripristina-backup.sh` | `/root/ripristina-backup.sh` | a mano, in emergenza |
| `crontab.txt` | `crontab -l` | — |

⚠️ **`crontab.txt` ha una chiave oscurata** (`key=<…>` nella riga di korauto).
Il crontab vero è sul VPS e dentro l'archivio di backup cifrato. Se lo
reinstalli da qui, quella riga va rimessa a mano.

## Il monitor — perché è severo

La versione precedente accettava qualunque `2xx`/`3xx` **senza seguire il
redirect**. Il 31 agosto 2026 questo l'ha tenuta cieca su **due siti
irraggiungibili insieme**: `aala.global` e `auto.aala.global` rimandavano
ogni visitatore a `https://localhost:3000/it` e `https://localhost:3001/sq`,
cioè al computer di chi guardava. Il monitor li dava per vivi — un 307 è pur
sempre una risposta. Nel log c'è la prova: `2026-08-25 03:25
auto.aala.global: down -> up (HTTP 307)`. Quel «tornato su» era il redirect
verso localhost, e il sito è rimasto giù **sei giorni**.

Ora un sito è vivo solo se passa **quattro prove**:

1. seguendo i redirect si arriva a **200**;
2. si finisce **sul dominio giusto** — è questa che prende il redirect a
   localhost, e nessuna delle altre;
3. il corpo contiene un **marcatore** noto (non una pagina d'errore che
   risponde 200);
4. il corpo supera una **dimensione minima** (un guscio vuoto passa le prime tre).

Più: riprova una volta dopo 20s prima di gridare, `flock` per non accavallare
i giri, l'email dice **quale** prova è fallita, e se l'invio a Resend non va a
buon fine **lo scrive nel log** invece di tacere — un allarme che fallisce in
silenzio è lo stesso difetto un livello più su.

## Supabase: le pagine verdi non bastano

Dal **21 settembre al 13 ottobre 2026** i container di Supabase
(`/opt/supabase-nabuel`) sono rimasti **fermi** — fermati tutti insieme
alle 22:21 UTC, uscita 137, politica `unless-stopped`, quindi un riavvio
non li avrebbe riaccesi. Per tre settimane login, registrazione, ordini e
lead di aala.global hanno risposto **502**, e il monitor era tutto verde:
guardava solo le pagine, che si costruiscono anche senza database. L'ha
scoperto il titolare, che non riusciva più a iscriversi né a entrare come
admin.

Ora ci sono due controlli sulle API di Supabase (`supabase-auth` e
`supabase-rest`). Le API vogliono la chiave pubblica (anon) nell'intestazione,
altrimenti rispondono 401: lo dice il sesto campo `supabase` della riga, e lo
script la legge da `.env.local`. Provato che mordano: marcatore impossibile →
giù; senza chiave → «HTTP 401».

⚠️ **Mai fermare Supabase per liberare memoria** senza riaccenderlo subito
dopo (`cd /opt/supabase-nabuel && docker compose start`): con
`unless-stopped` un container fermato a mano resta fermo per sempre.

## Aggiungere un controllo

Una riga nell'array `CHECKS`:

```
"nome | url | dominio_finale_atteso | marcatore | byte_minimi [| supabase]"
```

Il sesto campo, facoltativo, `supabase` aggiunge l'intestazione `apikey`.

Il marcatore va **scelto guardando la pagina vera**, non immaginato: deve
essere una stringa che sparisce se il sito si rompe. Poi verifica che il
controllo morda davvero, mettendo un marcatore impossibile e controllando che
fallisca.

## Comandi

```bash
/opt/uptime-monitor.sh verbose   # giro con esito per ogni controllo
/opt/uptime-monitor.sh test      # manda un'email di prova (dice se parte davvero)
tail -f /var/log/uptime-monitor.log
```
