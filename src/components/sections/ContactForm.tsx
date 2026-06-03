'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const SERVICE_VALUES = ['medical', 'webpages', 'auto', 'taxi', 'legal', 'dental', 'other'] as const;

export function ContactForm() {
  const t = useTranslations('contact.form');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Si è verificato un errore. Riprova.');
      }
      setState('sent');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Errore');
    }
  }

  if (state === 'sent') {
    return (
      <div className="card-paper flex flex-col items-center gap-4 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Check className="h-7 w-7" />
        </div>
        <h3 className="font-display text-2xl text-ink">{t('received')}</h3>
        <p className="text-ink-soft">{t('willReply')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card-paper space-y-5 p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="name" label={t('name')} required />
        <Field name="company" label={t('company')} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="email" type="email" label={t('email')} required />
        <Field name="phone" label={t('phone')} />
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink-mute">
          {t('service')}
        </span>
        <select
          name="service"
          className="w-full rounded-lg border border-ink-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-gold"
        >
          {SERVICE_VALUES.map((v) => (
            <option key={v} value={v}>
              {t(`services.${v}` as any)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink-mute">
          {t('message')}
        </span>
        <textarea
          name="message"
          rows={5}
          required
          className="w-full rounded-lg border border-ink-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-gold"
        />
      </label>

      <button
        type="submit"
        disabled={state === 'sending'}
        className={cn('btn-primary w-full justify-center', state === 'sending' && 'opacity-60')}
      >
        {state === 'sending' ? t('sending') : t('send')}
        <Send className="h-4 w-4" />
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink-mute">
        {label}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full rounded-lg border border-ink-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-gold"
      />
    </label>
  );
}
