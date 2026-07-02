// Store in-memory dei codici di reset password (singolo processo pm2, condiviso
// tra le route /api/auth/forgot e /api/auth/reset perché è lo stesso modulo).
// I codici scadono in 15 minuti. Su restart si perdono (l'utente ne richiede uno nuovo).
type Entry = { code: string; expires: number; attempts: number };
const store = new Map<string, Entry>();

function key(email: string) {
  return email.trim().toLowerCase();
}

export function setResetCode(email: string, code: string) {
  store.set(key(email), { code, expires: Date.now() + 15 * 60 * 1000, attempts: 0 });
}

export function verifyResetCode(email: string, code: string): boolean {
  const e = store.get(key(email));
  if (!e) return false;
  if (Date.now() > e.expires) { store.delete(key(email)); return false; }
  e.attempts += 1;
  if (e.attempts > 8) { store.delete(key(email)); return false; } // anti brute-force
  return e.code === code.trim();
}

export function clearResetCode(email: string) {
  store.delete(key(email));
}
