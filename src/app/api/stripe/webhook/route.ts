import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { VERTICAL_LIST } from '@/lib/products';
import { isValidMonths } from '@/lib/billing';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Bad signature' },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const plan = VERTICAL_LIST.flatMap((v) => v.plans).find((p) => p.id === planId);

        if (userId && planId && plan) {
          if (session.mode === 'payment') {
            // difesa in profondità: la durata è già validata in /api/checkout, ma se
            // arrivasse un valore anomalo nei metadata lo riportiamo a 1.
            const rawMonths = parseInt(session.metadata?.months ?? '1', 10);
            const months = isValidMonths(rawMonths) ? rawMonths : 1;
            // importo realmente pagato (include sconto durata e promo), non il listino
            const amountEur =
              session.amount_total != null
                ? Math.round(session.amount_total / 100)
                : plan.price;
            // payment_intent può essere stringa o oggetto espanso
            const paymentIntent =
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : (session.payment_intent?.id ?? null);
            const paidAt = new Date();
            const periodEnd = new Date(paidAt);
            periodEnd.setMonth(periodEnd.getMonth() + months);
            const { error: insErr } = await supabase.from('orders').insert({
              user_id: userId,
              product_id: planId,
              stripe_session_id: session.id,
              stripe_payment_intent: paymentIntent,
              amount_eur: amountEur,
              status: 'paid',
              paid_at: paidAt.toISOString(),
              metadata: {
                months,
                vertical: session.metadata?.vertical || null,
                period_end: periodEnd.toISOString(),
                method: 'stripe',
              },
            });
            // Idempotenza: Stripe consegna lo stesso evento più volte. Se l'ordine
            // per questa sessione esiste già (unique stripe_session_id), va bene:
            // ignoriamo il duplicato e rispondiamo 200 per non far ritentare Stripe.
            if (insErr && !/duplicate|unique|already exists/i.test(insErr.message)) {
              throw new Error(insErr.message);
            }
          }
          // Subscription objects are handled in subscription.* events below.
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(sub.customer as string);
        const userId = !('deleted' in customer) ? customer.metadata?.userId : null;
        if (!userId) break;

        const planId = sub.metadata?.planId ?? null;
        const plan = VERTICAL_LIST.flatMap((v) => v.plans).find((p) => p.id === planId);
        const vertical = plan ? VERTICAL_LIST.find((v) => v.plans.includes(plan))?.key : null;
        // niente vertical affidabile → non attivare un prodotto a caso (era 'medical')
        if (!vertical) break;

        await supabase.from('subscriptions').upsert({
          id: sub.id,
          user_id: userId,
          product_id: planId,
          vertical,
          status: sub.status,
          // su subscription 'incomplete' i campi periodo sono assenti → guardia anti-crash
          current_period_start: sub.current_period_start
            ? new Date(sub.current_period_start * 1000).toISOString()
            : null,
          current_period_end: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: sub.cancel_at_period_end,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('id', sub.id);
        break;
      }

      default:
        // unhandled — return 200 so Stripe doesn't retry
        break;
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook error' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
