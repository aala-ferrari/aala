import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('legalPages.privacy');
  return { title: t('title') };
}

export default async function PrivacyPage() {
  const t = await getTranslations('legalPages.privacy');
  return (
    <section className="pt-28 pb-16 sm:pt-32 sm:pb-24">
      <div className="container-aala max-w-3xl prose">
        <h1 className="font-display text-5xl tracking-tight">{t('title')}</h1>
        <p className="text-ink-soft">{t('lastUpdated')}</p>

        <div className="mt-10 space-y-6 text-ink-soft leading-relaxed">
          <p>{t('placeholder1')}</p>
          <p>{t('placeholder2')}</p>
        </div>
      </div>
    </section>
  );
}
