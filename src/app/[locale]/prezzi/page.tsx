import type { Metadata } from 'next';
import { VERTICAL_LIST } from '@/lib/products';
import { PricingSection } from '@/components/sections/PricingSection';
import { CallToAction } from '@/components/sections/CallToAction';

export const metadata: Metadata = {
  title: 'Prezzi',
  description: 'Tutti i pacchetti AALA: CRM Medical, Auto, Legal, Dental Tourism.',
};

export default function PricingPage() {
  return (
    <>
      <section className="pt-32 pb-12">
        <div className="container-aala text-center">
          <h1 className="font-display text-5xl tracking-tight sm:text-6xl">
            <span className="gold-text">Prezzi</span> trasparenti
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-soft">
            Una-tantum per progetti custom. Abbonamenti mensili per i prodotti SaaS.
            Nessun costo nascosto, nessuna sorpresa.
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
