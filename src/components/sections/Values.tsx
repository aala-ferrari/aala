'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { GoldenGlobe } from '@/components/3d/GoldenGlobe';

const KEYS = ['trust', 'luxury', 'security', 'support'] as const;
const ROMANS = ['I', 'II', 'III', 'IV'] as const;

export function Values() {
  const t = useTranslations('home.values');

  return (
    <section className="relative bg-canvas-warm/40 py-16 sm:py-24">
      <div aria-hidden className="absolute inset-0 -z-10 bg-radial-gold opacity-40" />

      <div className="container-aala">
        {/* Intestazione */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="gold-rule mx-auto mb-8 w-24" />
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-gold">
            {t('eyebrow')}
          </p>
          <h2 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-base text-ink-soft">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Layout: globo + valori */}
        <div className="mt-10 grid items-center gap-10 sm:mt-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* GLOBO */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-xs sm:max-w-sm"
          >
            <GoldenGlobe />

            {/* legenda piccola sotto */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-widest text-ink-mute">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_8px_2px_rgba(245,230,168,0.6)]" />
                {t('legendAala')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-deep/70" />
                {t('legendWorld')}
              </span>
            </div>
          </motion.div>

          {/* VALORI lista */}
          <div className="space-y-1">
            {KEYS.map((key, i) => (
              <ValueRow
                key={key}
                roman={ROMANS[i]}
                title={t(`items.${key}.title`)}
                desc={t(`items.${key}.desc`)}
                delay={i * 0.08}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueRow({
  roman,
  title,
  desc,
  delay,
}: {
  roman: string;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative grid grid-cols-[auto_1fr] items-baseline gap-5 border-l border-gold/30 py-5 pl-6 transition-colors duration-500 hover:border-gold"
    >
      {/* Marker oro animato a sinistra */}
      <span
        aria-hidden
        className="absolute -left-[5px] top-7 h-2 w-2 rounded-full bg-gold/50 transition-all duration-500 group-hover:scale-150 group-hover:bg-gold group-hover:shadow-[0_0_12px_2px_rgba(245,230,168,0.7)]"
      />

      <span className="font-display text-3xl leading-none text-gold/60 transition-colors duration-500 group-hover:text-gold sm:text-4xl">
        {roman}
      </span>

      <div>
        <h3 className="font-display text-xl tracking-tight text-ink">
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{desc}</p>
      </div>
    </motion.div>
  );
}
