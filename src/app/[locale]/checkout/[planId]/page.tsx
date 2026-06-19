import { redirect, notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
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

  // Nome servizio e piano dal catalogo tradotto (fallback all'italiano di products.ts)
  const tc = await getTranslations('catalog');
  const k = vertical.key;
  const label = tc.has(`${k}.heroEyebrow`) ? tc(`${k}.heroEyebrow`) : vertical.hero.eyebrow;
  const planName = tc.has(`${k}.plans.${plan.id}.name`)
    ? tc(`${k}.plans.${plan.id}.name`)
    : plan.name;

  return (
    <CheckoutConfigurator
      locale={params.locale}
      plan={{ id: plan.id, name: planName, price: plan.price, billing: plan.billing }}
      vertical={{ key: vertical.key, label, accent: vertical.accent }}
    />
  );
}
