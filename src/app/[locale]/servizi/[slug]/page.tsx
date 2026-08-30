import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { VERTICAL_LIST } from '@/lib/products';
import { verticalMeta, VERTICAL_SEO, altLanguages, canonical, type VerticalSeoKey } from '@/lib/seo';
import { ServiceJsonLd } from '@/components/seo/StructuredData';
import { ProductShowcase } from '@/components/sections/ProductShowcase';
import { ServiceFeatures } from '@/components/sections/ServiceFeatures';
import { PlanGrid } from '@/components/sections/PlanGrid';
import { CallToAction } from '@/components/sections/CallToAction';
import { LegalDocsNote } from '@/components/sections/LegalDocsNote';

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
  const m = verticalMeta(vertical.key as VerticalSeoKey, params.locale);
  const path = `/servizi/${vertical.slug}`;
  return {
    title: m.title,
    description: m.description,
    keywords: VERTICAL_SEO[vertical.key as VerticalSeoKey]?.keywords,
    alternates: { canonical: canonical(params.locale, path), languages: altLanguages(path) },
    openGraph: { type: 'website', siteName: 'AALA', url: canonical(params.locale, path), title: m.title, description: m.description },
    twitter: { card: 'summary_large_image', title: m.title, description: m.description },
  };
}

export default function ServicePage({ params }: { params: { slug: string; locale: string } }) {
  const vertical = VERTICAL_LIST.find((v) => v.slug === params.slug);
  if (!vertical) notFound();

  return (
    <>
      <ServiceJsonLd vertical={vertical.key as VerticalSeoKey} locale={params.locale} slug={vertical.slug} />
      {/* Hero + grande mockup + dual CTA */}
      <ProductShowcase vertical={vertical} />

      {/* Caratteristiche bento */}
      <ServiceFeatures vertical={vertical} />

      {/* Prezzi — ancora "prezzi" per il bottone "Vedi i prezzi" del CTA */}
      <div id="prezzi">
        <PlanGrid vertical={vertical} />
      </div>

      {/* Solo il legale: i suoi documenti si leggono prima di firmare.
          Nel footer sarebbe su ogni pagina, anche taxi e dental — la' e' rumore. */}
      {vertical.key === 'legal' && <LegalDocsNote locale={params.locale} />}

      <CallToAction />
    </>
  );
}
