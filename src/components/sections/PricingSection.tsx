'use client';

import { useTranslations } from 'next-intl';
import { PlanGrid } from './PlanGrid';
import type { Vertical } from '@/lib/products';
import { useCatalog } from '@/lib/use-catalog';

export function PricingSection({ vertical }: { vertical: Vertical }) {
  const hero = useCatalog().hero(vertical);
  const ts = useTranslations('home.services');
  // Un servizio con più famiglie di pacchetti (CRM · Webpages: Siti web, poi
  // CRM) si presenta col suo nome e lascia la parola ai titoli delle famiglie:
  // il titolo della sua pagina («Il gestionale che il tuo studio medico
  // merita») sopra i pacchetti dei siti web non c'entrava.
  const nome =
    vertical.planGroups?.length && ts.has(`${vertical.key}.name`) ? ts(`${vertical.key}.name`) : null;
  return (
    <section className="py-12">
      <div className="container-aala">
        <div className="mb-2 flex items-center gap-3">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: vertical.accent }}
          />
          <p
            className="text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: vertical.accent }}
          >
            {nome ?? hero.eyebrow}
          </p>
        </div>
        {!nome && (
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{hero.title}</h2>
        )}
      </div>
      <PlanGrid vertical={vertical} showHeader={false} />
    </section>
  );
}
