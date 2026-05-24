'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HeroBackground } from '@/components/3d/HeroBackground';
import { Button } from '@/components/ui/Button';

export function Hero() {
  const t = useTranslations('home.hero');
  const locale = useLocale();

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-16">
      <HeroBackground />

      <div className="container-aala relative">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
          }}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
            }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold/30 bg-canvas-paper/70 px-4 py-1.5 text-xs text-ink-soft backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            {t('eyebrow')}
          </motion.div>

          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
            }}
            className="mt-8 font-display text-5xl leading-[1.05] tracking-tight text-balance text-ink sm:text-6xl md:text-7xl"
          >
            {t.rich('title', {
              gold: (chunks) => <span className="gold-text">{chunks}</span>,
            })}
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
            }}
            className="mx-auto mt-8 max-w-2xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg"
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
            }}
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button href={`/${locale}#services`}>
              {t('ctaPrimary')}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href={`/${locale}/contatti`} variant="ghost">
              {t('ctaSecondary')}
            </Button>
          </motion.div>
        </motion.div>

        <ScrollHint />
      </div>
    </section>
  );
}

function ScrollHint() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="flex h-10 w-6 items-start justify-center rounded-full border border-ink-line p-1.5"
      >
        <div className="h-2 w-1 rounded-full bg-gold/70" />
      </motion.div>
    </div>
  );
}
