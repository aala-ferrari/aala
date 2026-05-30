'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BollaAssistant } from './BollaAssistant';

/**
 * Il pulsante flottante che apre la Bolla parlante.
 * Una sfera dorata che pulsa, in basso a sinistra (così non collide col
 * WhatsApp a destra). Mostra un fumetto-invito dopo qualche secondo.
 */
export function BollaLauncher() {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    if (open) {
      setHint(false);
      return;
    }
    const t = setTimeout(() => setHint(true), 6000);
    const t2 = setTimeout(() => setHint(false), 16000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && <BollaAssistant key="panel" onClose={() => setOpen(false)} />}
      </AnimatePresence>

      {!open && (
        <div className="fixed bottom-5 left-5 z-50 flex items-center gap-3 sm:bottom-7 sm:left-7">
          <button
            onClick={() => setOpen(true)}
            aria-label="Parla con la Bolla di AALA"
            className="relative flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110 sm:h-16 sm:w-16"
          >
            {/* onde pulsanti oro (come WhatsApp) */}
            <span className="bolla-ripple" aria-hidden />
            <span className="bolla-ripple bolla-ripple-delay" aria-hidden />

            {/* sfera dorata brillante, decisa, con bordo che stacca dal cream */}
            <span
              className="relative flex h-full w-full items-center justify-center rounded-full ring-2 ring-gold-deep/60"
              style={{
                background:
                  'radial-gradient(circle at 32% 26%, #fff3c4 0%, #f0c860 30%, #d4a02e 60%, #8a6717 100%)',
                animation: 'bollaGlow 2.4s ease-in-out infinite',
              }}
            >
              <span className="text-2xl drop-shadow-[0_1px_2px_rgba(80,55,10,0.6)]">🫧</span>
            </span>
          </button>

          {/* fumetto invito */}
          <AnimatePresence>
            {hint && (
              <button
                onClick={() => setOpen(true)}
                className="hidden rounded-2xl rounded-bl-sm bg-canvas-paper px-4 py-2 text-left text-sm text-ink shadow-soft sm:block"
                style={{ boxShadow: '0 8px 24px -10px rgba(15,25,42,0.25)' }}
              >
                Ciao! Posso aiutarti? 🫧
              </button>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
