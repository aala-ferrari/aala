#!/usr/bin/env bash
# ============================================================
# AALA — setup su VPS Ubuntu 22.04/24.04 (eseguire come root)
# Mette online il sito su https://aala.global con:
#  - Node 20 + l'app (pm2, riparte da sola)
#  - Claude CLI headless (cervello della Bolla via abbonamento)
#  - nginx reverse proxy + SSL gratis (certbot)
# ============================================================
set -euo pipefail

DOMAIN="aala.global"
REPO="https://github.com/aala-ferrari/aala.git"
APPDIR="/opt/aala"
EMAIL="giovannibaglioo@libero.it"   # per il certificato SSL

echo "==> 1/6  Sistema + Node 20 + strumenti"
apt-get update -y
apt-get install -y curl git nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2 @anthropic-ai/claude-code

echo "==> 2/6  Codice dal tuo GitHub"
if [ -d "$APPDIR/.git" ]; then
  cd "$APPDIR" && git pull
else
  git clone "$REPO" "$APPDIR" && cd "$APPDIR"
fi
npm ci

echo "==> 3/6  Variabili d'ambiente"
if [ ! -f "$APPDIR/.env.local" ]; then
  cp "$APPDIR/.env.example" "$APPDIR/.env.local"
  echo "   ⚠️  COMPILA $APPDIR/.env.local con le tue chiavi (Supabase, ecc.)"
  echo "   ⚠️  Per il cervello CLI: aggiungi CLAUDE_CODE_OAUTH_TOKEN=... (vedi README-VPS.md)"
  echo "   Poi rilancia questo script."
  exit 0
fi

echo "==> 4/6  Build + avvio con pm2"
npm run build
pm2 delete aala 2>/dev/null || true
pm2 start npm --name aala -- start
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

echo "==> 5/6  nginx reverse proxy (porta 3000)"
cat > /etc/nginx/sites-available/aala <<NGINX
server {
  listen 80;
  server_name ${DOMAIN} www.${DOMAIN};
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
NGINX
ln -sf /etc/nginx/sites-available/aala /etc/nginx/sites-enabled/aala
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> 6/6  SSL gratis (Let's Encrypt)"
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" \
  --non-interactive --agree-tos -m "${EMAIL}" --redirect

echo ""
echo "✅ FATTO. Punta il DNS di ${DOMAIN} (A record) all'IP di questo VPS."
echo "   Controlla: pm2 logs aala   |   pm2 restart aala"
