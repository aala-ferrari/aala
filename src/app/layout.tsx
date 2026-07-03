import type { Metadata } from 'next';
import { SITE, SITE_KEYWORDS } from '@/lib/seo';
import './globals.css';

const DESC =
  'AALA: software gestionale, avvocato AI (Super Avokati), agente vocale AI (Nabuel), noleggio auto, CRM medico, taxi app e turismo dentale. Una sola alleanza per far crescere la tua impresa in Albania e in Europa.';

export const metadata: Metadata = {
  title: {
    default: 'AALA — Software, AI e Servizi Premium per l’Impresa in Albania',
    template: '%s · AALA',
  },
  description: DESC,
  applicationName: 'AALA',
  keywords: SITE_KEYWORDS,
  metadataBase: new URL(SITE.url),
  alternates: { canonical: SITE.url },
  authors: [{ name: 'AALA' }],
  category: 'technology',
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: {
    type: 'website', siteName: 'AALA', url: SITE.url, locale: 'it_IT',
    title: 'AALA — Software, AI e Servizi Premium per l’Impresa in Albania', description: DESC,
  },
  twitter: { card: 'summary_large_image', title: 'AALA — Software e AI per l’Impresa', description: DESC },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
