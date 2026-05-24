'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, KeyRound, Stethoscope, Car, Scale, Smile } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import type { Vertical, VerticalKey } from '@/lib/products';
import { MedicalMockup } from '@/components/mockups/MedicalMockup';
import { AutoMockup } from '@/components/mockups/AutoMockup';
import { LegalMockup } from '@/components/mockups/LegalMockup';
import { DentalMockup } from '@/components/mockups/DentalMockup';
import { DemoRequestModal } from './DemoRequestModal';

const MOCKUP_BY_VERTICAL: Record<VerticalKey, () => JSX.Element> = {
  medical: MedicalMockup,
  auto: AutoMockup,
  legal: LegalMockup,
  dental: DentalMockup,
};

const ICONS = { medical: Stethoscope, auto: Car, legal: Scale, dental: Smile };

// URL del prodotto vero per il bottone "Apri demo dal vivo".
// Locale: tutti girano sul Mac sui rispettivi porti.
const LIVE_DEMO_URL: Partial<Record<VerticalKey, string>> = {
  medical: 'http://localhost:4002',
  auto: 'http://localhost:4011',
  legal: 'http://localhost:5050',
  dental: 'https://medicalalbania.com',
};

export function ProductShowcase({ vertical }: { vertical: Vertical }) {
  const Mockup = MOCKUP_BY_VERTICAL[vertical.key];
  const Icon = ICONS[vertical.key];
  const liveDemo = LIVE_DEMO_URL[vertical.key];
  const locale = useLocale();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="relative overflow-hidden pt-32 pb-16">
      {/* themed soft background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 55% 50% at 50% 0%, rgba(${vertical.accentRgb}, 0.16), transparent 70%),
            radial-gradient(ellipse 40% 30% at 90% 20%, rgba(176, 138, 62, 0.10), transparent 70%),
            #f6f1e6`,
        }}
      />
      <div className="grid-pattern absolute inset-0 -z-10 opacity-50" />

      <div className="container-aala">
        {/* hero header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
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

          {/* triple CTA: richiedi → prova → prezzi */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            {liveDemo ? (
              <a
                href={liveDemo}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Apri demo dal vivo
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <button onClick={() => setModalOpen(true)} className="btn-primary">
                Richiedi accesso demo
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <Link href={`/${locale}/demo`} className="btn-dark">
              <KeyRound className="h-4 w-4" />
              Prova demo
            </Link>

            <a href="#prezzi" className="btn-ghost">
              Vedi i prezzi
            </a>
          </div>

          <p className="mt-4 text-xs text-ink-mute">
            Hai già il codice? Click su "Prova demo" e incollalo.
          </p>
        </motion.div>

        {/* big mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
          className="relative mx-auto mt-16 max-w-6xl"
        >
          <div
            aria-hidden
            className="absolute -inset-x-8 -bottom-8 -top-4 -z-10 rounded-[2.5rem] blur-3xl"
            style={{ background: `rgba(${vertical.accentRgb}, 0.15)` }}
          />
          <Mockup />
        </motion.div>
      </div>

      <DemoRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        vertical={vertical}
      />
    </section>
  );
}
