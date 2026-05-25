import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { VERTICAL_LIST } from '@/lib/products';
import { PricingSection } from '@/components/sections/PricingSection';
import { CallToAction } from '@/components/sections/CallToAction';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pricingPage');
  return {
    title: t('eyebrow'),
    description: t('subtitle'),
  };
}

export default async function PricingPage() {
  const t = await getTranslations('pricingPage');

  return (
    <>
      <section className="pt-28 pb-8 sm:pt-32 sm:pb-12">
        <div className="container-aala text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
            {t('eyebrow')}
          </p>
          <h1 className="mt-4 font-display text-5xl tracking-tight sm:text-6xl">
            {t('titlePre')}
            <span className="gold-text">{t('titleHighlight')}</span>
            {t('titlePost')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-soft">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {VERTICAL_LIST.map((v) => (
        <PricingSection key={v.key} vertical={v} />
      ))}

      <CallToAction />
    </>
  );
}
