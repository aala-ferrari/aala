'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Scorrimento "setoso" stile brand di lusso (Lenis).
 * - Solo miglioramento: lo scroll diventa morbido senza toccare nulla del layout.
 * - Rispetta `prefers-reduced-motion`: se l'utente lo chiede, NON si attiva.
 * - Si disattiva da solo su touch (mobile usa lo scroll nativo, già fluido).
 * - I container con scroll proprio (es. chat della Bolla) usano `data-lenis-prevent`.
 */
export function SmoothScroll() {
  useEffect(() => {
    // Accessibilità: chi ha "riduci movimento" attivo resta sullo scroll nativo.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const lenis = new Lenis({
      lerp: 0.1, // morbidezza dell'inseguimento (più basso = più dolce)
      smoothWheel: true, // smussa la rotellina del mouse / trackpad
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      // Su mobile lasciamo lo scroll nativo (già fluido e batteria-friendly)
      syncTouch: false,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
