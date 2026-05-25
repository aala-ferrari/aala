'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { Stethoscope, Car, Scale, Smile, Smartphone, ArrowUpRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MiniBolla } from '@/components/3d/MiniBolla';

type Vertical = 'medical' | 'auto' | 'legal' | 'dental' | 'taxi';

const VERTICALS: {
  key: Vertical;
  href: string;
  icon: typeof Stethoscope;
  color: string;
  rgb: string;
  highlights: string[];
}[] = [
  {
    key: 'medical',
    href: '/servizi/crm',
    icon: Stethoscope,
    color: '#0e7c8a',
    rgb: '14, 124, 138',
    highlights: [
      'CRM su misura per ogni settore',
      'Siti web 100% custom — niente template',
      'GDPR + sicurezza enterprise',
    ],
  },
  {
    key: 'auto',
    href: '/servizi/auto',
    icon: Car,
    color: '#a85a1a',
    rgb: '168, 90, 26',
    highlights: ['Flotta in tempo reale', 'Booking online', 'App mobile cliente'],
  },
  {
    key: 'legal',
    href: '/servizi/legal',
    icon: Scale,
    color: '#8a6717',
    rgb: '138, 103, 23',
    highlights: ['AI ricerca documentale', 'Calendario udienze', 'Pratiche illimitate'],
  },
  {
    key: 'dental',
    href: '/servizi/dental',
    icon: Smile,
    color: '#2a7a5c',
    rgb: '42, 122, 92',
    highlights: ['Lead qualificati', 'Campagne multilingua', 'Esclusiva di zona'],
  },
  {
    key: 'taxi',
    href: '/servizi/taxi',
    icon: Smartphone,
    color: '#f5b800',
    rgb: '245, 184, 0',
    highlights: [
      'App passeggero + driver brandizzate',
      'Dispatching automatico stile Bolt',
      'Pagamenti integrati + mappa live',
    ],
  },
];

export function Services() {
  const t = useTranslations('home.services');
  const locale = useLocale();

  return (
    <section id="services" className="relative py-16 sm:py-24">
      <div className="container-aala">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="gold-rule mx-auto mb-8 w-24" />
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">I servizi</p>
          <h2 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-ink-soft">{t('subtitle')}</p>
        </motion.div>

        <div className="mt-10 grid gap-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {VERTICALS.map((v, i) => (
            <ServiceCard
              key={v.key}
              vertical={v}
              index={i}
              locale={locale}
              name={t(`${v.key}.name`)}
              desc={t.rich(`${v.key}.desc`, { em: (chunks) => <em className="text-ink-soft/80">{chunks}</em> })}
              learnMore={t('learnMore')}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  vertical,
  index,
  locale,
  name,
  desc,
  learnMore,
}: {
  vertical: (typeof VERTICALS)[number];
  index: number;
  locale: string;
  name: string;
  desc: React.ReactNode;
  learnMore: string;
}) {
  const Icon = vertical.icon;
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
    >
      <Link
        href={`/${locale}${vertical.href}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={cn(
          'group relative block h-full overflow-hidden rounded-3xl bg-canvas-paper transition-all duration-500',
          'shadow-soft hover:-translate-y-1 hover:shadow-lift'
        )}
        style={{
          borderTop: `2px solid ${vertical.color}`,
        }}
      >
        {/* glow di sfondo che pulsa */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:opacity-50"
          style={{
            background: `radial-gradient(circle, rgba(${vertical.rgb}, 0.6), transparent 70%)`,
          }}
        />

        {/* shimmer line oro in basso */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(176,138,62,0.6), transparent)',
          }}
        />

        <div className="relative grid grid-cols-[100px_1fr] gap-5 p-8">
          {/* mini-bolla 3D — più piccola ma "viva" come il hero */}
          <div className="flex flex-col items-center gap-3">
            <MiniBolla
              color={vertical.color}
              hover={hover}
              className="h-24 w-24 rounded-full"
            />
            <div
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background: `rgba(${vertical.rgb}, 0.10)`,
                color: vertical.color,
              }}
            >
              <Icon className="h-4 w-4" />
            </div>
          </div>

          {/* contenuto */}
          <div className="flex flex-col">
            <h3 className="font-display text-2xl text-ink">{name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{desc}</p>

            <ul className="mt-5 space-y-2">
              {vertical.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2 text-xs text-ink-soft"
                >
                  <Check
                    className="mt-0.5 h-3 w-3 shrink-0"
                    style={{ color: vertical.color }}
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <div
              className="mt-6 flex items-center gap-1.5 text-xs font-medium transition group-hover:gap-2.5"
              style={{ color: vertical.color }}
            >
              {learnMore}
              <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
