import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DemoCodeForm } from './DemoCodeForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('demoEntry');
  return {
    title: t('eyebrow'),
    description: t('subtitle'),
  };
}

export default async function DemoEntryPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { code?: string };
}) {
  const t = await getTranslations('demoEntry');

  return (
    <section className="flex min-h-screen items-center justify-center pt-24 pb-16">
      <div className="container-aala max-w-md">
        <div className="card-paper p-8">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
            {t('eyebrow')}
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-ink">
            {t('titlePre')}
            <span className="gold-text">{t('titleHighlight')}</span>
          </h1>
          <p className="mt-3 text-sm text-ink-soft">{t('subtitle')}</p>

          <div className="mt-8">
            <DemoCodeForm
              locale={params.locale}
              initialCode={searchParams.code}
              autoSubmit={Boolean(searchParams.code)}
              labels={{
                placeholder: t('placeholder'),
                submit: t('submit'),
                verifying: t('verifying'),
                openingProduct: t('openingProduct'),
                fallbackLink: t('fallbackLink'),
              }}
            />
          </div>

          <div className="mt-8 border-t border-ink-line/70 pt-6 text-center">
            <p className="text-xs text-ink-soft">{t('noCodeYet')}</p>
            <a
              href={`/${params.locale}/contatti`}
              className="mt-2 inline-block text-sm font-medium text-gold hover:underline"
            >
              {t('requestAccess')} →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
