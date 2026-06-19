import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { sendLeadNotificationEmail } from '@/lib/email';

const LeadSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  company: z.string().max(160).optional(),
  service: z.enum(['medical', 'webpages', 'auto', 'taxi', 'legal', 'dental', 'nabuel', 'other']).optional(),
  message: z.string().min(5).max(4000),
  locale: z.string().max(5).optional(),
  source: z.enum(['contact-form', 'consultant-request']).optional(),
});

// Traduce l'errore di validazione in una frase chiara per l'utente
function friendlyError(field: unknown): string {
  switch (field) {
    case 'email':
      return "Inserisci un'email valida.";
    case 'name':
      return 'Inserisci il tuo nome.';
    case 'message':
      return 'Scrivi due righe in più nel messaggio (almeno 5 caratteri).';
    default:
      return 'Controlla i campi e riprova.';
  }
}

export async function POST(req: Request) {
  const parsed = LeadSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return NextResponse.json({ error: friendlyError(field) }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { source, ...lead } = parsed.data;
  const { error } = await supabase.from('leads').insert({
    ...lead,
    source: source ?? 'contact-form',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notifica in tempo reale all'admin (info@aala.global) — best-effort:
  // se Resend non è configurato viene saltata, senza bloccare il cliente.
  try {
    await sendLeadNotificationEmail({ ...lead, source: source ?? 'contact-form' });
  } catch {
    /* la notifica non è critica per il cliente */
  }

  return NextResponse.json({ ok: true });
}
