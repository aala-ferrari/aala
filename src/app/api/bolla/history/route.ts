/**
 * GET /api/bolla/history
 *
 * Restituisce la cronologia chat persistente della Bolla per l'utente loggato.
 * Per visitatori anonimi (nessuna sessione Supabase): risposta vuota — la chat
 * resta effimera in client come prima.
 *
 * Il payload è leggero: array di {role, content, ts?} + last_service + ultimo
 * whatsapp_message AI-generato, così riapre dove l'utente aveva lasciato.
 *
 * DELETE /api/bolla/history → reset chat (utile per il pulsante "ricomincia").
 */
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type StoredMsg = { role: 'user' | 'assistant'; content: string; ts?: string };

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Anonimo → nessuna cronologia da restituire.
    return NextResponse.json({ messages: [], lastService: null, whatsappMessage: null });
  }

  const { data, error } = await supabase
    .from('bolla_conversations')
    .select('messages, last_service, whatsapp_message')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    // Tabella non ancora migrata? Non rompiamo l'UX della Bolla.
    return NextResponse.json({ messages: [], lastService: null, whatsappMessage: null });
  }

  const msgs = Array.isArray(data?.messages) ? (data!.messages as StoredMsg[]) : [];
  return NextResponse.json({
    messages: msgs,
    lastService: (data?.last_service as string | null) ?? null,
    whatsappMessage: (data?.whatsapp_message as string | null) ?? null,
  });
}

export async function DELETE() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: true });
  }
  await supabase.from('bolla_conversations').delete().eq('user_id', user.id);
  return NextResponse.json({ ok: true });
}
