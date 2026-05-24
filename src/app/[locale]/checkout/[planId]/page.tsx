import { redirect, notFound } from 'next/navigation';
import { CheckoutRedirect } from './CheckoutRedirect';
import { VERTICAL_LIST } from '@/lib/products';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function CheckoutPage({
  params,
}: {
  params: { planId: string; locale: string };
}) {
  const plan = VERTICAL_LIST.flatMap((v) => v.plans).find((p) => p.id === params.planId);
  if (!plan) notFound();
  if (plan.billing === 'contact') {
    redirect(`/${params.locale}/contatti?plan=${plan.id}`);
  }

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${params.locale}/login?next=/checkout/${plan.id}`);
  }

  return <CheckoutRedirect planId={plan.id} planName={plan.name} locale={params.locale} />;
}
