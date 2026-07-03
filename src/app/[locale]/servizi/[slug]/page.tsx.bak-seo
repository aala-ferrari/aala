import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { VERTICAL_LIST } from '@/lib/products';
import { ProductShowcase } from '@/components/sections/ProductShowcase';
import { ServiceFeatures } from '@/components/sections/ServiceFeatures';
import { PlanGrid } from '@/components/sections/PlanGrid';
import { CallToAction } from '@/components/sections/CallToAction';

export function generateStaticParams() {
  return VERTICAL_LIST.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; locale: string };
}): Promise<Metadata> {
  const vertical = VERTICAL_LIST.find((v) => v.slug === params.slug);
  if (!vertical) return {};
  // titolo/descrizione SEO tradotti dal catalogo, con fallback all'italiano
  const t = await getTranslations({ locale: params.locale, namespace: 'catalog' });
  const k = vertical.key;
  return {
    title: t.has(`${k}.heroEyebrow`) ? t(`${k}.heroEyebrow`) : vertical.hero.eyebrow,
    description: t.has(`${k}.heroSubtitle`) ? t(`${k}.heroSubtitle`) : vertical.hero.subtitle,
  };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const vertical = VERTICAL_LIST.find((v) => v.slug === params.slug);
  if (!vertical) notFound();

  return (
    <>
      {/* Hero + grande mockup + dual CTA */}
      <ProductShowcase vertical={vertical} />

      {/* Caratteristiche bento */}
      <ServiceFeatures vertical={vertical} />

      {/* Prezzi — ancora "prezzi" per il bottone "Vedi i prezzi" del CTA */}
      <div id="prezzi">
        <PlanGrid vertical={vertical} />
      </div>

      <CallToAction />
    </>
  );
}
