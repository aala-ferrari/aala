'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useMemo } from 'react';

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
      {/* Base più caldo del solo cream — sfumatura ricca champagne/oro */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 70% 25%, rgba(212,168,87,0.40) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 15% 30%, rgba(176,138,62,0.22) 0%, transparent 60%), radial-gradient(ellipse 90% 70% at 50% 100%, rgba(246,241,230,1) 0%, transparent 70%), linear-gradient(180deg, #faf3e3 0%, #f6f1e6 70%, #efe7d3 100%)',
        }}
      />

      {/* Blob d'oro fluttuanti */}
      <FloatingBlobs />

      {/* Particelle d'oro che salgono sui lati */}
      <SideDust />

      {/* Cornici art-deco verticali */}
      <SideOrnaments />

      <div className="grid-pattern absolute inset-0 opacity-50" />

      {enabled && <LuxuryScene />}

      {/* Vignette agli angoli — spotlight feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 50%, rgba(120,90,30,0.18) 100%)',
        }}
      />

      {/* Fade bottom — più sottile per ridurre spazio vuoto */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent via-canvas/60 to-canvas" />
    </div>
  );
}

function FloatingBlobs() {
  return (
    <>
      <div
        aria-hidden
        className="absolute h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl"
        style={{
          top: '-8rem',
          left: '-6rem',
          background: 'radial-gradient(circle, rgba(212,168,87,0.55), transparent 70%)',
          animation: 'blobDrift1 22s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden
        className="absolute h-[32rem] w-[32rem] rounded-full opacity-40 blur-3xl"
        style={{
          top: '-4rem',
          right: '-10rem',
          background: 'radial-gradient(circle, rgba(176,138,62,0.5), transparent 70%)',
          animation: 'blobDrift2 28s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden
        className="absolute h-[24rem] w-[24rem] rounded-full opacity-35 blur-3xl"
        style={{
          bottom: '-6rem',
          left: '20%',
          background: 'radial-gradient(circle, rgba(236,220,176,0.7), transparent 70%)',
          animation: 'blobDrift3 25s ease-in-out infinite',
        }}
      />
    </>
  );
}

function SideDust() {
  const left = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        x: (i * 7.3) % 14,
        size: 1 + ((i * 17) % 4),
        delay: (i * 1.7) % 18,
        duration: 12 + ((i * 3) % 10),
      })),
    []
  );
  const right = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        x: (i * 5.1) % 14,
        size: 1 + ((i * 13) % 4),
        delay: (i * 2.3) % 18,
        duration: 10 + ((i * 4) % 12),
      })),
    []
  );

  return (
    <>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[20%]">
        {left.map((p, i) => (
          <span
            key={`L${i}`}
            className="absolute rounded-full bg-gold"
            style={{
              left: `${5 + p.x * 5}%`,
              bottom: '-2rem',
              width: `${p.size}px`,
              height: `${p.size}px`,
              boxShadow: '0 0 10px 2px rgba(212,175,55,0.7)',
              animation: `dustRise ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[20%]">
        {right.map((p, i) => (
          <span
            key={`R${i}`}
            className="absolute rounded-full bg-gold"
            style={{
              right: `${5 + p.x * 5}%`,
              bottom: '-2rem',
              width: `${p.size}px`,
              height: `${p.size}px`,
              boxShadow: '0 0 10px 2px rgba(212,175,55,0.7)',
              animation: `dustRise ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}

function SideOrnaments() {
  return (
    <>
      <svg
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 hidden h-[22rem] w-6 -translate-y-1/2 text-gold/40 lg:block"
        viewBox="0 0 24 400"
        fill="none"
      >
        <line x1="12" y1="20" x2="12" y2="380" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
        <circle cx="12" cy="80" r="3" fill="currentColor" opacity="0.6" />
        <circle cx="12" cy="200" r="4" fill="currentColor" opacity="0.8" />
        <circle cx="12" cy="320" r="3" fill="currentColor" opacity="0.6" />
        <path d="M 12,200 m -8,0 l 16,0" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      </svg>
      <svg
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 hidden h-[22rem] w-6 -translate-y-1/2 text-gold/40 lg:block"
        viewBox="0 0 24 400"
        fill="none"
      >
        <line x1="12" y1="20" x2="12" y2="380" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
        <circle cx="12" cy="80" r="3" fill="currentColor" opacity="0.6" />
        <circle cx="12" cy="200" r="4" fill="currentColor" opacity="0.8" />
        <circle cx="12" cy="320" r="3" fill="currentColor" opacity="0.6" />
        <path d="M 12,200 m -8,0 l 16,0" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      </svg>
    </>
  );
}
