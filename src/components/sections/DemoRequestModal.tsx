'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import type { Vertical } from '@/lib/products';

export function DemoRequestModal({
  open,
  onClose,
  vertical,
}: {
  open: boolean;
  onClose: () => void;
  vertical: Vertical;
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          service: vertical.key,
          message: `Richiesta demo per ${vertical.hero.eyebrow}. ${data.message ?? ''}`,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setState('sent');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Errore');
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 20, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-canvas-paper shadow-lift"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-ink-mute transition hover:bg-canvas-warm hover:text-ink"
              aria-label="Chiudi"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-8">
              {state === 'sent' ? (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Check className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-2xl text-ink">Richiesta ricevuta.</h3>
                  <p className="text-ink-soft">
                    Ti contatteremo entro 24 ore con un link demo personalizzato.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p
                      className="text-[10px] font-medium uppercase tracking-[0.25em]"
                      style={{ color: vertical.accent }}
                    >
                      {vertical.hero.eyebrow}
                    </p>
                    <h3 className="mt-2 font-display text-2xl text-ink">
                      Richiedi accesso demo
                    </h3>
                    <p className="mt-2 text-sm text-ink-soft">
                      Compila il form, ti contattiamo entro 24 ore con credenziali e
                      un piccolo onboarding.
                    </p>
                  </div>

                  <form onSubmit={onSubmit} className="space-y-4">
                    <Field name="name" label="Nome" required />
                    <Field name="email" type="email" label="Email" required />
                    <Field name="company" label="Azienda / studio" />
                    <Field name="message" label="Note (opzionale)" multiline />

                    <button
                      type="submit"
                      disabled={state === 'sending'}
                      className="btn-primary w-full justify-center"
                    >
                      {state === 'sending' ? 'Invio...' : 'Invia richiesta'}
                    </button>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required,
  multiline,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const cls =
    'w-full rounded-lg border border-ink-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold';
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-ink-mute">
        {label}
      </span>
      {multiline ? (
        <textarea name={name} rows={3} required={required} className={cls} />
      ) : (
        <input type={type} name={name} required={required} className={cls} />
      )}
    </label>
  );
}
