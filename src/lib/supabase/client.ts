'use client';

import { createBrowserClient } from '@supabase/ssr';

// Singleton: un solo client per tutta l'app. Evita che il doppio mount di
// React StrictMode crei due client che si contendono il lock auth del browser
// (causa di getSession()/getUser() che restano appesi in dev).
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (_client) return _client;
  _client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Lock no-op: il navigator.locks di Supabase può far restare appese
        // (o abortire con "failed to fetch") le operazioni signUp/signIn quando
        // un'altra tab/operazione tiene il lock. Eseguiamo subito la funzione.
        // Sicuro: usiamo già un singleton, niente contesa tra più client.
        lock: async (_name, _acquireTimeout, fn) => fn(),
      },
    }
  );
  return _client;
}
