import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyResetCode, clearResetCode } from '@/lib/reset-store';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

const Body = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(8),
  password: z.string().min(8).max(128),
});

// Verifica il codice e imposta la nuova password (via service-role admin API).
export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });

  const { email, code, password } = body.data;
  if (!verifyResetCode(email, code)) {
    return NextResponse.json({ error: 'codice non valido o scaduto' }, { status: 400 });
  }

  const admin = createSupabaseServiceClient();
  // Trova l'utente per email (prima pagina; base utenti piccola).
  const { data, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) return NextResponse.json({ error: 'server_error' }, { status: 500 });
  const user = data.users.find((u) => (u.email ?? '').toLowerCase() === email.toLowerCase());
  if (!user) {
    // Il codice era valido ma l'email non ha un account: messaggio generico.
    return NextResponse.json({ error: 'account non trovato per questa email' }, { status: 400 });
  }

  const { error: updErr } = await admin.auth.admin.updateUserById(user.id, { password });
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  clearResetCode(email);
  return NextResponse.json({ ok: true });
}
