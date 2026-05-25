import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('notFound');
  return (
    <section className="flex min-h-screen items-center justify-center pt-24">
      <div className="container-aala max-w-md text-center">
        <p className="text-xs uppercase tracking-widest text-ink-mute">{t('label')}</p>
        <h1 className="mt-4 font-display text-6xl tracking-tight">
          <span className="gold-text">{t('title')}</span>
        </h1>
        <p className="mt-4 text-ink-soft">{t('subtitle')}</p>
        <Link href="/" className="btn-primary mt-10">
          {t('back')}
        </Link>
      </div>
    </section>
  );
}
