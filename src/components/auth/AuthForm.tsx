'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email'));
    const password = String(form.get('password'));
    const fullName = form.get('full_name') ? String(form.get('full_name')) : undefined;

    const supabase = createSupabaseBrowserClient();

    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // torna dove l'utente stava andando (es. /checkout/...), altrimenti area cliente.
    // `next` deve essere un path interno (inizia con "/", non "//") per evitare open-redirect.
    const next = searchParams.get('next');
    const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
    router.push(safeNext ? `/${locale}${safeNext}` : `/${locale}/account`);
    router.refresh();
  }

  return (
    <div className="card-paper p-6 sm:p-8">
      <h1 className="font-display text-2xl sm:text-3xl text-ink">
        {mode === 'login' ? 'Bentornato' : 'Crea il tuo account'}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        {mode === 'login' ? 'Accedi alla tua area cliente AALA.' : 'Bastano 30 secondi.'}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {mode === 'signup' && <Field name="full_name" label="Nome e cognome" required />}
        <Field name="email" type="email" label="Email" required />
        <Field name="password" type="password" label="Password" required />

        <button
          type="submit"
          disabled={loading}
          className={cn('btn-primary w-full justify-center', loading && 'opacity-60')}
        >
          {loading ? 'Attendi...' : mode === 'login' ? 'Accedi' : 'Crea account'}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <div className="mt-6 text-center text-sm text-ink-soft">
        {mode === 'login' ? (
          <>
            Nuovo qui?{' '}
            <Link href={`/${locale}/signup`} className="text-gold hover:underline">
              Crea un account
            </Link>
          </>
        ) : (
          <>
            Hai già un account?{' '}
            <Link href={`/${locale}/login`} className="text-gold hover:underline">
              Accedi
            </Link>
          </>
        )}
      </div>
    </div>
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
