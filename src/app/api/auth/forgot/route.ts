import { NextResponse } from 'next/server';
import { z } from 'zod';
import { setResetCode } from '@/lib/reset-store';
import { sendPasswordResetCode } from '@/lib/email';

const Body = z.object({ email: z.string().email() });

// Genera un codice a 6 cifre e lo invia via email. Risponde SEMPRE ok (non
// riveliamo se l'email esiste, per privacy/sicurezza).
export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ ok: true });

  const email = body.data.email;
  const code = String(Math.floor(100000 + Math.random() * 900000));
  setResetCode(email, code);
  try {
    await sendPasswordResetCode({ to: email, code });
  } catch {
    // best-effort: se Resend non è configurato o il dominio non è verificato,
    // non blocchiamo (l'utente vedrà comunque il passo "inserisci codice").
  }
  return NextResponse.json({ ok: true });
}
