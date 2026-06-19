'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth');
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
        {mode === 'login' ? t('loginTitle') : t('signupTitle')}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        {mode === 'login' ? t('loginSubtitle') : t('signupSubtitle')}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {mode === 'signup' && <Field name="full_name" label={t('fullName')} required />}
        <Field name="email" type="email" label={t('email')} required />
        <Field name="password" type="password" label={t('password')} required />

        <button
          type="submit"
          disabled={loading}
          className={cn('btn-primary w-full justify-center', loading && 'opacity-60')}
        >
          {loading ? t('loading') : mode === 'login' ? t('loginSubmit') : t('signupSubmit')}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <div className="mt-6 text-center text-sm text-ink-soft">
        {mode === 'login' ? (
          <>
            {t('newHere')}{' '}
            <Link href={`/${locale}/signup`} className="text-gold hover:underline">
              {t('createAccount')}
            </Link>
          </>
        ) : (
          <>
            {t('haveAccount')}{' '}
            <Link href={`/${locale}/login`} className="text-gold hover:underline">
              {t('signIn')}
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
