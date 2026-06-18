'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, KeyRound, Stethoscope, Car, Scale, Smile, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Vertical, VerticalKey } from '@/lib/products';
import { useCatalog } from '@/lib/use-catalog';
import { MedicalMockup } from '@/components/mockups/MedicalMockup';
import { AutoMockup } from '@/components/mockups/AutoMockup';
import { LegalMockup } from '@/components/mockups/LegalMockup';
import { DentalMockup } from '@/components/mockups/DentalMockup';
import { TaxiMockup } from '@/components/mockups/TaxiMockup';
import { DemoRequestModal } from './DemoRequestModal';

const MOCKUP_BY_VERTICAL: Record<VerticalKey, () => JSX.Element> = {
  medical: MedicalMockup,
  auto: AutoMockup,
  legal: LegalMockup,
  dental: DentalMockup,
  taxi: TaxiMockup,
};

const ICONS = { medical: Stethoscope, auto: Car, legal: Scale, dental: Smile, taxi: Smartphone };

// URL del prodotto vero per il bottone "Apri demo dal vivo".
// Default = URL pubblici di produzione (subdomain aala.global / dominio reale).
// In locale, durante dev sul Mac, si può override via NEXT_PUBLIC_URL_PRODUCT_*
// per puntare ai server locali (es. http://localhost:5050 per Super Avokati).
const LIVE_DEMO_URL: Partial<Record<VerticalKey, string>> = {
  medical: process.env.NEXT_PUBLIC_URL_PRODUCT_CRM_MEDICAL || 'https://crm.aala.global',
  auto: process.env.NEXT_PUBLIC_URL_PRODUCT_AUTO || 'https://auto.aala.global',
  legal: process.env.NEXT_PUBLIC_URL_PRODUCT_LEGAL || 'https://superavokati.ai',
  dental: process.env.NEXT_PUBLIC_URL_PRODUCT_DENTAL || 'https://medicalalbania.com',
};

export function ProductShowcase({ vertical }: { vertical: Vertical }) {
  const Mockup = MOCKUP_BY_VERTICAL[vertical.key];
  const Icon = ICONS[vertical.key];
  const liveDemo = LIVE_DEMO_URL[vertical.key];
  const locale = useLocale();
  const t = useTranslations('showcase');
  const hero = useCatalog().hero(vertical);
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
            {hero.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight text-balance text-ink sm:text-6xl">
            {hero.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-ink-soft">
            {hero.subtitle}
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
                {t('openLiveDemo')}
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <button onClick={() => setModalOpen(true)} className="btn-primary">
                {t('requestDemoAccess')}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <Link href={`/${locale}/demo`} className="btn-dark">
              <KeyRound className="h-4 w-4" />
              {t('tryDemo')}
            </Link>

            <a href="#prezzi" className="btn-ghost">
              {t('seePricing')}
            </a>
          </div>

          <p className="mt-4 text-xs text-ink-mute">{t('haveCodeHint')}</p>
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
