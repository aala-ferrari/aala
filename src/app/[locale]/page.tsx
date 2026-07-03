import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { Values } from '@/components/sections/Values';
import { CallToAction } from '@/components/sections/CallToAction';
import { SITE_KEYWORDS, altLanguages, canonical } from '@/lib/seo';

const HOME_DESC =
  'Noleggio auto in Albania, avvocato AI Super Avokati, agente vocale AI Nabuel, CRM medico, taxi app e turismo dentale. Una sola alleanza per far crescere la tua impresa in Albania e in Europa.';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return {
    title: 'AALA — Software, AI e Servizi Premium per l\u2019Impresa in Albania',
    description: HOME_DESC,
    keywords: SITE_KEYWORDS,
    alternates: { canonical: canonical(params.locale, ''), languages: altLanguages('') },
    openGraph: { type: 'website', siteName: 'AALA', url: canonical(params.locale, ''), title: 'AALA — Software e AI per l\u2019Impresa in Albania', description: HOME_DESC },
  };
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Values />
      <CallToAction />
    </>
  );
}
