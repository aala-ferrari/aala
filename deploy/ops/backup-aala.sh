#!/bin/bash
# Backup automatico giornaliero dell'ecosistema AALA: DB + secrets + nginx.
# Creato 25/06/2026. Rotazione: tiene gli ultimi 10 archivi.
TS=$(date +%Y%m%d-%H%M)
D=/opt/backups/$TS
mkdir -p $D/env $D/nginx
docker exec supabase-db pg_dumpall -U supabase_admin > $D/supabase_all.sql 2>/dev/null || docker exec supabase-db pg_dumpall -U postgres > $D/supabase_all.sql 2>/dev/null
docker exec taxi_postgres pg_dump -U taxi taxi > $D/taxi.sql 2>/dev/null
docker exec auto_postgres pg_dumpall -U postgres > $D/auto_all.sql 2>/dev/null
docker cp super-avvocato:/app/data/app.db $D/super-avvocato-app.db 2>/dev/null
cp /var/www/apps/taxi/backend/.env $D/env/taxi-backend.env 2>/dev/null
cp /var/www/apps/aala/.env.local $D/env/aala.env.local 2>/dev/null
cp /opt/nabuel/backend/gateway/.env $D/env/nabuel-gateway.env 2>/dev/null
docker exec super-avvocato cat /app/.env > $D/env/super-avvocato.env 2>/dev/null
cp /var/www/apps/korauto/.env.local $D/env/korauto.env.local 2>/dev/null
cp /var/www/apps/korauto/data/model-names.json $D/korauto-model-names.json 2>/dev/null
cp -r /etc/nginx/sites-available/* $D/nginx/ 2>/dev/null
cp -r /opt/nabuel/backend/gateway/src "$D/nabuel-gateway-src" 2>/dev/null
cp -r /opt/nabuel/backend/gateway/public "$D/nabuel-gateway-public" 2>/dev/null
cp -r /opt/nabuel/homepage "$D/nabuel-homepage" 2>/dev/null
# Gli script che tengono in piedi la macchina: monitor, backup (anche questo),
# ripristino, permessi. Senza, dopo un disastro si recuperano i dati ma non il
# modo di rimetterli a posto. E il crontab, altrimenti tornano al loro posto e
# nessuno li chiama piu'.
mkdir -p $D/ops-scripts
cp /opt/*.sh $D/ops-scripts/ 2>/dev/null
cp /root/permessi-dati.sh /root/ripristina-backup.sh $D/ops-scripts/ 2>/dev/null
cp /usr/local/sbin/docker-port-guard.sh $D/ops-scripts/ 2>/dev/null
crontab -l > $D/ops-scripts/crontab.txt 2>/dev/null
cp -r /etc/ssh/sshd_config.d $D/ops-scripts/sshd_config.d 2>/dev/null

tar czf /opt/backups/aala-FULL-$TS.tar.gz -C /opt/backups $TS 2>/dev/null
# Cifratura su UNA riga di proposito: il tentativo con le continuazioni
# si e' rotto fra gli escape e ha prodotto un backup in chiaro.
openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -in /opt/backups/aala-FULL-$TS.tar.gz -out /opt/backups/aala-FULL-$TS.tar.gz.enc -pass file:/root/.backup-key && rm -f /opt/backups/aala-FULL-$TS.tar.gz
rm -rf $D
ls -t /opt/backups/aala-FULL-*.tar.gz.enc 2>/dev/null | tail -n +11 | xargs -r rm -f
echo "$(date '+%Y-%m-%d %H:%M') backup OK: aala-FULL-$TS.tar.gz ($(du -h /opt/backups/aala-FULL-$TS.tar.gz.enc 2>/dev/null | cut -f1))"
