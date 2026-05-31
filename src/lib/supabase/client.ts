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
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return _client;
}
