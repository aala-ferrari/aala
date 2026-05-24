'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Orrery } from '@/components/3d/Orrery';

export function CallToAction() {
  const t = useTranslations('home.cta');
  const locale = useLocale();

  return (
    <section className="relative py-32">
      <div className="container-aala">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2.5rem]"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 50% 50%, #fbf8f0 0%, #f6f1e6 60%, #efe7d3 100%)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.8) inset, 0 30px 80px -30px rgba(176,138,62,0.25), 0 0 0 1px rgba(231,224,207,0.8)',
          }}
        >
          {/* Cornici sottili oro decorative agli angoli */}
          <CornerOrnament position="top-left" />
          <CornerOrnament position="top-right" />
          <CornerOrnament position="bottom-left" />
          <CornerOrnament position="bottom-right" />

          {/* Scena 3D orrery di sfondo */}
          <div className="relative min-h-[500px] sm:min-h-[560px]">
            <Orrery />

            {/* Velo bianco-trasparente sul centro per leggibilità testo */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 50% 40% at 50% 60%, rgba(251,248,240,0.85) 0%, rgba(246,241,230,0) 70%)',
              }}
            />

            {/* Contenuto testuale */}
            <div className="relative z-10 flex flex-col items-center justify-center px-8 py-20 text-center sm:px-12 sm:py-28">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-canvas-paper/80 px-4 py-1.5 text-xs text-ink-soft backdrop-blur"
              >
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span className="uppercase tracking-[0.2em]">In sintonia con la tua impresa</span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="mx-auto mt-4 max-w-xl text-pretty text-lg text-ink sm:text-xl"
              >
                {t('subtitle')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-32 sm:mt-44"
              >
                <Button href={`/${locale}/contatti`}>
                  {t('button')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CornerOrnament({
  position,
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const map = {
    'top-left':     'top-5 left-5 rotate-0',
    'top-right':    'top-5 right-5 rotate-90',
    'bottom-left':  'bottom-5 left-5 -rotate-90',
    'bottom-right': 'bottom-5 right-5 rotate-180',
  } as const;
  return (
    <svg
      aria-hidden
      className={`absolute z-20 h-8 w-8 text-gold/50 ${map[position]}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M2 12 L2 2 L12 2" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="2" cy="2" r="1.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
