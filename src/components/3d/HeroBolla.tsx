'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const LuxuryScene = dynamic(
  () => import('./LuxuryScene').then((m) => m.LuxuryScene),
  { ssr: false }
);

/**
 * La "bolla di Zhiva" — sfera 3D oro morfante, ora dentro una colonna
 * delimitata (non più background full-bleed). Così il testo non ci finisce
 * mai sopra e resta sempre leggibile.
 */
export function HeroBolla() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowMem = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
    setEnabled(!reduced && !lowMem);
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-[92%] max-w-[26rem] sm:w-full sm:max-w-md lg:max-w-none">
      {/* alone dorato dietro */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,168,87,0.5), transparent 65%)',
          transform: 'scale(0.85)',
        }}
      />

      {/* fallback statico se WebGL disabilitato */}
      {!enabled && (
        <div
          className="absolute inset-[12%] rounded-full"
          style={{
            background:
              'radial-gradient(circle at 35% 30%, #f5e6a8 0%, #d4a857 45%, #7a5a18 100%)',
            boxShadow: '0 30px 60px -20px rgba(120,90,30,0.5)',
          }}
        />
      )}

      {enabled && <LuxuryScene />}
    </div>
  );
}
