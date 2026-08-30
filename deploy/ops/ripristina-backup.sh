#!/bin/bash
# Riapre un backup cifrato.  Uso:  ./ripristina-backup.sh <file.enc> [uscita]
#
# Esiste perché una cifratura senza istruzioni di ripristino non è sicurezza:
# è un modo elegante di perdere i dati. Se stai leggendo questo in emergenza,
# la chiave è /root/.backup-key — e se il server non c'è più, è quella che
# l'utente ha messo nel suo gestore di password.
set -euo pipefail
IN="${1:?serve il file .enc}"
OUT="${2:-${IN%.enc}}"
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 \
  -in "$IN" -out "$OUT" -pass file:/root/.backup-key
echo "riaperto: $OUT"
