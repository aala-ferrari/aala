import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';

const Body = z.object({ action: z.enum(['confirm', 'cancel']) });

/**
 * Admin conferma o annulla un ordine assistito (manuale).
 * confirm → status 'paid' (+ paid_at + period_end): il prodotto si attiva per il cliente.
 * cancel  → status 'failed'.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ssr = createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

  const admin = createSupabaseServiceClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  // l'ordine deve esistere (e leggo i metadata per la durata)
  const { data: order } = await admin
    .from('orders')
    .select('metadata, status')
    .eq('id', params.id)
    .maybeSingle();
  if (!order) {
    return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 });
  }
  // si agisce solo su ordini in attesa: evita di riconfermare (sposta period_end)
  // o di "riattivare" un ordine già pagato/annullato.
  if (order.status !== 'pending') {
    return NextResponse.json(
      { error: `Ordine già ${order.status}, nessuna azione possibile.` },
      { status: 409 }
    );
  }

  if (body.data.action === 'cancel') {
    const { error } = await admin
      .from('orders')
      .update({ status: 'failed' })
      .eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: 'failed' });
  }

  // confirm: calcolo la scadenza periodo dai mesi salvati
  const months = Number((order.metadata as Record<string, unknown> | null)?.months ?? 1) || 1;
  const paidAt = new Date();
  const periodEnd = new Date(paidAt);
  periodEnd.setMonth(periodEnd.getMonth() + months);

  const { error } = await admin
    .from('orders')
    .update({
      status: 'paid',
      paid_at: paidAt.toISOString(),
      metadata: {
        ...((order.metadata as Record<string, unknown> | null) ?? {}),
        period_end: periodEnd.toISOString(),
        confirmed_by: user.id,
      },
    })
    .eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, status: 'paid' });
}
