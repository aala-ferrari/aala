import { PlanGrid } from './PlanGrid';
import type { Vertical } from '@/lib/products';

export function PricingSection({ vertical }: { vertical: Vertical }) {
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
            {vertical.hero.eyebrow}
          </p>
        </div>
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
          {vertical.hero.title}
        </h2>
      </div>
      <PlanGrid vertical={vertical} />
    </section>
  );
}
