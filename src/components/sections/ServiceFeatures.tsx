'use client';

import { motion } from 'framer-motion';
import type { Vertical } from '@/lib/products';

export function ServiceFeatures({ vertical }: { vertical: Vertical }) {
  return (
    <section className="py-24">
      <div className="container-aala">
        <div className="grid gap-6 md:grid-cols-2">
          {vertical.features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="card-paper relative overflow-hidden p-7"
            >
              <div
                aria-hidden
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-25 blur-2xl"
                style={{ background: `rgba(${vertical.accentRgb}, 0.45)` }}
              />
              <h3 className="font-display text-2xl text-ink">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
