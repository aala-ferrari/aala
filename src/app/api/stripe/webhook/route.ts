import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { VERTICAL_LIST } from '@/lib/products';

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
            await supabase.from('orders').insert({
              user_id: userId,
              product_id: planId,
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent as string | null,
              amount_eur: plan.price,
              status: 'paid',
              paid_at: new Date().toISOString(),
            });
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
        const vertical = plan ? VERTICAL_LIST.find((v) => v.plans.includes(plan))?.key : 'medical';

        await supabase.from('subscriptions').upsert({
          id: sub.id,
          user_id: userId,
          product_id: planId,
          vertical: vertical ?? 'medical',
          status: sub.status,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
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
