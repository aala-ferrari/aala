import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('legalPages.terms');
  return { title: t('title') };
}

export default async function TermsPage() {
  const t = await getTranslations('legalPages.terms');
  return (
    <section className="pt-28 pb-16 sm:pt-32 sm:pb-24">
      <div className="container-aala max-w-3xl prose">
        <h1 className="font-display text-5xl tracking-tight">{t('title')}</h1>
        <p className="text-ink-soft">{t('placeholder')}</p>
      </div>
    </section>
  );
}
