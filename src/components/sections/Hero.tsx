'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HeroBackground } from '@/components/3d/HeroBackground';
import { HeroBolla } from '@/components/3d/HeroBolla';
import { Button } from '@/components/ui/Button';

export function Hero() {
  const t = useTranslations('home.hero');
  const locale = useLocale();

  return (
    <section className="relative isolate flex min-h-[92svh] items-center overflow-hidden pt-20 pb-14 sm:pb-20">
      <HeroBackground />

      <div className="container-aala relative">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* ── COLONNA TESTO ── (sotto su mobile, sinistra su desktop) */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
            }}
            className="order-2 text-center lg:order-1 lg:text-left"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
              }}
              className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-canvas-paper/70 px-4 py-1.5 text-xs text-ink-soft backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              {t('eyebrow')}
            </motion.div>

            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
              }}
              className="mt-6 font-display text-4xl leading-[1.06] tracking-tight text-balance text-ink sm:text-5xl lg:text-6xl xl:text-7xl"
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
              className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg lg:mx-0"
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
              }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4 lg:justify-start"
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

          {/* ── COLONNA BOLLA ── (sopra su mobile, destra su desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2"
          >
            <HeroBolla />
          </motion.div>
        </div>
      </div>

      <ScrollHint />
    </section>
  );
}

function ScrollHint() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center sm:flex">
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
