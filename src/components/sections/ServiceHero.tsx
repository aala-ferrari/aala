'use client';

import { motion } from 'framer-motion';
import { Stethoscope, Car, Scale, Smile } from 'lucide-react';
import type { Vertical } from '@/lib/products';

const ICONS = { medical: Stethoscope, auto: Car, legal: Scale, dental: Smile };

export function ServiceHero({ vertical }: { vertical: Vertical }) {
  const Icon = ICONS[vertical.key];

  return (
    <section className="relative isolate overflow-hidden pt-32 pb-24">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 0%, rgba(${vertical.accentRgb}, 0.18), transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 20%, rgba(176, 138, 62, 0.10), transparent 70%),
            #f6f1e6`,
        }}
      />
      <div className="grid-pattern absolute inset-0 -z-10 opacity-60" />

      <div className="container-aala">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div
            className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: `rgba(${vertical.accentRgb}, 0.10)`,
              color: vertical.accent,
            }}
          >
            <Icon className="h-7 w-7" />
          </div>
          <p
            className="mt-6 text-xs font-medium uppercase tracking-[0.25em]"
            style={{ color: vertical.accent }}
          >
            {vertical.hero.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight text-balance text-ink sm:text-6xl">
            {vertical.hero.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-ink-soft">
            {vertical.hero.subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
