import { redirect, notFound } from 'next/navigation';
import { CheckoutConfigurator } from './CheckoutConfigurator';
import { VERTICAL_LIST } from '@/lib/products';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function CheckoutPage({
  params,
}: {
  params: { planId: string; locale: string };
}) {
  const vertical = VERTICAL_LIST.find((v) => v.plans.some((p) => p.id === params.planId));
  const plan = vertical?.plans.find((p) => p.id === params.planId);
  if (!plan || !vertical) notFound();
  if (plan.billing === 'contact') {
    redirect(`/${params.locale}/contatti?plan=${plan.id}`);
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${params.locale}/login?next=/checkout/${plan.id}`);
  }

  return (
    <CheckoutConfigurator
      locale={params.locale}
      plan={{ id: plan.id, name: plan.name, price: plan.price, billing: plan.billing }}
      vertical={{ key: vertical.key, label: vertical.hero.eyebrow, accent: vertical.accent }}
    />
  );
}
