import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { VERTICAL_LIST } from '@/lib/products';
import { priceForDuration } from '@/lib/billing';
import { getNestPayConfig, buildPaymentFields } from '@/lib/nestpay';

export const dynamic = 'force-dynamic';

const Body = z.object({
  planId: z.string(),
  months: z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)]).optional(),
  customer: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
});

/**
 * Crea l'ordine (pending) e prepara la sessione di pagamento con carta sul
 * gateway Credins (NestPay 3D Secure). Se il gateway NON è ancora configurato
 * (nessuna credenziale nel .env), risponde { configured: false } e il frontend
 * usa il flusso placeholder (ordine assistito) — così nulla si rompe.
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const { planId, months: reqMonths, customer } = parsed.data;

  const plan = VERTICAL_LIST.flatMap((v) => v.plans).find((p) => p.id === planId);
  if (!plan) return NextResponse.json({ error: 'Unknown plan' }, { status: 404 });
  if (plan.billing === 'contact') return NextResponse.json({ error: 'Plan requires contact' }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

  const hasDuration = plan.billing === 'monthly';
  const months = hasDuration ? (reqMonths ?? 1) : 1;
  const breakdown = hasDuration ? priceForDuration(plan.price, months) : null;
  const amount = breakdown ? breakdown.total : plan.price;
  const vertical = VERTICAL_LIST.find((v) => v.plans.some((p) => p.id === plan.id))?.key ?? null;

  // Riferimento ordine univoco per il gateway (oid)
  const oid = 'AALA' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

  const admin = createSupabaseServiceClient();
  const { data: order, error } = await admin
    .from('orders')
    .insert({
      user_id: user.id,
      product_id: plan.id,
      amount_eur: amount,
      status: 'pending',
      metadata: { months, vertical, method: 'card_credins', oid, customer: customer ?? null },
    })
    .select('id')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const cfg = getNestPayConfig();
  if (!cfg) {
    // Gateway non ancora attivo → il frontend mostra il placeholder "ordine registrato".
    return NextResponse.json({ configured: false, amount, oid, orderId: order.id });
  }

  const base = cfg.baseUrl.replace(/\/$/, '');
  const fields = buildPaymentFields(cfg, {
    oid,
    amount: Number(amount).toFixed(2),
    okUrl: `${base}/api/checkout/credins/callback`,
    failUrl: `${base}/api/checkout/credins/callback`,
    callbackUrl: `${base}/api/checkout/credins/callback`,
    email: customer?.email,
    billName: `${customer?.firstName ?? ''} ${customer?.lastName ?? ''}`.trim() || undefined,
  });

  // Il frontend costruisce un form nascosto e lo POSTa a `action` → pagina banca 3D.
  return NextResponse.json({ configured: true, action: cfg.gatewayUrl, fields });
}
