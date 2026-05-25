import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('about');
  return {
    title: t('eyebrow'),
    description: t('p1').slice(0, 160),
  };
}

export default async function AboutPage() {
  const t = await getTranslations('about');
  const p1 = t('p1');
  const dropCap = p1.charAt(0);
  const restOfP1 = p1.slice(1);

  return (
    <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-24">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-96 bg-radial-gold opacity-40"
      />

      <div className="container-aala max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
          {t('eyebrow')}
        </p>

        <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight text-balance text-ink sm:text-6xl">
          {t('titlePre')}
          <span className="gold-text">{t('titleHighlight')}</span>
          {t('titlePost')}
        </h1>

        <div className="mt-12 space-y-7 text-lg leading-relaxed text-ink-soft">
          <p className="text-pretty">
            <span className="font-display text-2xl text-ink">{dropCap}</span>
            {restOfP1}
          </p>

          <p className="text-pretty">
            {t.rich('p2', {
              strong: (chunks) => <span className="text-ink">{chunks}</span>,
            })}
          </p>

          <div className="my-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-gold/40" />
            <span className="font-display text-2xl text-gold">✦</span>
            <div className="h-px flex-1 bg-gold/40" />
          </div>

          <p className="text-pretty">
            {t.rich('p3', {
              brand: (chunks) => (
                <strong className="font-display text-ink">{chunks}</strong>
              ),
            })}
          </p>

          <p className="text-pretty">
            {t.rich('p4', {
              em: (chunks) => <em className="text-ink">{chunks}</em>,
            })}
          </p>

          <p className="text-pretty">
            {t.rich('p5', {
              strong: (chunks) => <span className="text-ink">{chunks}</span>,
            })}
          </p>

          <p className="mt-12 whitespace-pre-line text-center font-display text-2xl italic text-gold/90">
            "{t('quote')}"
          </p>
        </div>
      </div>
    </section>
  );
}
