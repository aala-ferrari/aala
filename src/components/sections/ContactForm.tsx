'use client';

import { useState } from 'react';
import { Send, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const SERVICES = [
  { value: 'medical',  label: 'CRM su misura (qualsiasi settore)' },
  { value: 'webpages', label: 'Sito web customizzato' },
  { value: 'auto',     label: 'Gestionale Auto' },
  { value: 'legal',    label: 'Super Avocati (studio legale)' },
  { value: 'dental',   label: 'Dental Tourism (clinica)' },
  { value: 'other',    label: 'Altro / Non so' },
];

export function ContactForm() {
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
      if (!res.ok) throw new Error(await res.text());
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
        <h3 className="font-display text-2xl text-ink">Messaggio ricevuto.</h3>
        <p className="text-ink-soft">Ti risponderemo entro 24 ore.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card-paper space-y-5 p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="name" label="Nome" required />
        <Field name="company" label="Azienda" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="email" type="email" label="Email" required />
        <Field name="phone" label="Telefono" />
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink-mute">
          Servizio di interesse
        </span>
        <select
          name="service"
          className="w-full rounded-lg border border-ink-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-gold"
        >
          {SERVICES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink-mute">
          Messaggio
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
        {state === 'sending' ? 'Invio...' : 'Invia messaggio'}
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
