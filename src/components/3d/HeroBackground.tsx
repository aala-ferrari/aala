'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const LuxuryScene = dynamic(
  () => import('./LuxuryScene').then((m) => m.LuxuryScene),
  { ssr: false }
);

export function HeroBackground() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowMem = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
    setEnabled(!reduced && !lowMem);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* gradient base — sempre visibile, anche durante il caricamento del WebGL */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 70% 20%, rgba(212,168,87,0.30), transparent 60%), radial-gradient(ellipse 50% 40% at 20% 30%, rgba(176,138,62,0.18), transparent 60%), radial-gradient(ellipse 80% 60% at 50% 100%, rgba(246,241,230,1), transparent 60%), #f6f1e6',
        }}
      />
      <div className="grid-pattern absolute inset-0 opacity-50" />
      {enabled && <LuxuryScene />}
      {/* fade verso il fondo per integrare con il resto della pagina */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-canvas" />
    </div>
  );
}
