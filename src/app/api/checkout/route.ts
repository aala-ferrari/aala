import { NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { VERTICAL_LIST } from '@/lib/products';

const Body = z.object({
  planId: z.string(),
  locale: z.string().default('it'),
});

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  // ensure stripe customer
  const admin = createSupabaseServiceClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', user.id)
    .single();

  let customerId = profile?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email!,
      name: profile?.full_name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
  }

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL!;
  const successUrl = `${origin}/${body.data.locale}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/${body.data.locale}/prezzi?checkout=cancelled`;

  const mode = plan.billing === 'one-time' ? 'payment' : 'subscription';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [
      plan.stripePriceId
        ? { price: plan.stripePriceId, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency: 'eur',
              unit_amount: plan.price * 100,
              product_data: { name: plan.name },
              ...(mode === 'subscription'
                ? { recurring: { interval: plan.billing === 'yearly' ? 'year' : 'month' } }
                : {}),
            },
          },
    ],
    metadata: { userId: user.id, planId: plan.id },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
