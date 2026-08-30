#!/bin/bash
# Rimette i permessi stretti sui dati di Super Avokati.
#
# Perche esiste: cartelle e file nascono 755/644 (leggibili da chiunque), e su
# questa macchina girano undici utenti non-root — nginx e i processi Node degli
# altri cinque siti. Con i permessi larghi, un difetto di lettura file in un
# QUALUNQUE altro prodotto arriverebbe ai fascicoli degli avvocati.
#
# Va rilanciato dopo un ripristino da backup o una migrazione: i permessi non
# sopravvivono a un tar estratto male.
D=/var/www/apps/super-avvocato/data
chmod 700 "$D" "$D/uploads" 2>/dev/null
find "$D/uploads" -type d -exec chmod 700 {} + 2>/dev/null
find "$D/uploads" -type f -exec chmod 600 {} + 2>/dev/null
chmod 600 "$D"/*.db "$D"/*.db-* 2>/dev/null
chown -R 1000:1000 "$D" 2>/dev/null
echo "permessi rimessi: $(ls -ld $D | awk "{print \$1}") su $D"
