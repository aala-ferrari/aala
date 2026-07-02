import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { VERTICAL_LIST } from '@/lib/products';
import { priceForDuration } from '@/lib/billing';

const Body = z.object({
  planId: z.string(),
  // SOLO durate vendibili (1/3/6/12) — vedi nota di sicurezza in /api/checkout
  months: z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)]).optional(),
});

/**
 * Ordine "assistito": il cliente conferma il pacchetto, noi creiamo un ordine
 * in stato `pending`. L'admin lo conferma (status → paid) dopo bonifico/accordo,
 * e a quel punto il prodotto risulta attivo nell'area cliente.
 * Finché non c'è il gateway bancario, è il canale di vendita principale in Albania.
 */
export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const plan = VERTICAL_LIST.flatMap((v) => v.plans).find((p) => p.id === body.data.planId);
  if (!plan) return NextResponse.json({ error: 'Unknown plan' }, { status: 404 });
  if (plan.billing === 'contact') {
    return NextResponse.json({ error: 'Plan requires contact' }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

  const hasDuration = plan.billing === 'monthly';
  const months = hasDuration ? (body.data.months ?? 1) : 1;
  const breakdown = hasDuration ? priceForDuration(plan.price, months) : null;
  const amount = breakdown ? breakdown.total : plan.price;
  const vertical = VERTICAL_LIST.find((v) => v.plans.some((p) => p.id === plan.id))?.key ?? null;

  const admin = createSupabaseServiceClient();

  // Deduplica: se c'è già un ordine in attesa per lo stesso cliente e piano,
  // non ne creiamo un altro (evita doppioni da doppio click / refresh / più tab).
  const { data: existing } = await admin
    .from('orders')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', plan.id)
    .eq('status', 'pending')
    .limit(1)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: true, amount, months, deduped: true });
  }

  const { error } = await admin.from('orders').insert({
    user_id: user.id,
    product_id: plan.id,
    amount_eur: amount,
    status: 'pending',
    metadata: { months, vertical, method: 'manual' },
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, amount, months });
}
