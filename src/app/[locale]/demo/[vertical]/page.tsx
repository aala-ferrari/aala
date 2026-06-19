import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Stethoscope, Car, Scale, Smile, Smartphone, PhoneCall, ExternalLink, ArrowLeft, Lock } from 'lucide-react';
import { VERTICALS, type VerticalKey } from '@/lib/products';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { MedicalMockup } from '@/components/mockups/MedicalMockup';
import { AutoMockup } from '@/components/mockups/AutoMockup';
import { LegalMockup } from '@/components/mockups/LegalMockup';
import { DentalMockup } from '@/components/mockups/DentalMockup';
import { TaxiMockup } from '@/components/mockups/TaxiMockup';
import { NabuelMockup } from '@/components/mockups/NabuelMockup';

const ICONS = { medical: Stethoscope, auto: Car, legal: Scale, dental: Smile, taxi: Smartphone, nabuel: PhoneCall };
const MOCKUPS = {
  medical: MedicalMockup,
  auto: AutoMockup,
  legal: LegalMockup,
  dental: DentalMockup,
  taxi: TaxiMockup,
  nabuel: NabuelMockup,
};

// URL del prodotto vero. Default = produzione; override via NEXT_PUBLIC_URL_PRODUCT_*
// quando si lavora in locale (e.g. dev sul Mac che gira tutto sui porti 4002/4011/5050).
const LIVE_PRODUCT_URL: Partial<Record<VerticalKey, string>> = {
  medical: process.env.NEXT_PUBLIC_URL_PRODUCT_CRM_MEDICAL || 'https://crm.aala.global',
  auto: process.env.NEXT_PUBLIC_URL_PRODUCT_AUTO || 'https://auto.aala.global',
  legal: process.env.NEXT_PUBLIC_URL_PRODUCT_LEGAL || 'https://superavokati.ai',
  dental: process.env.NEXT_PUBLIC_URL_PRODUCT_DENTAL || 'https://medicalalbania.com',
  taxi: process.env.NEXT_PUBLIC_URL_PRODUCT_TAXI || 'https://taxi.aala.global',
  nabuel: process.env.NEXT_PUBLIC_URL_PRODUCT_NABUEL || 'https://nabuel.com',
};

export default async function DemoLandingPage({
  params,
  searchParams,
}: {
  params: { vertical: string; locale: string };
  searchParams: { code?: string };
}) {
  const key = params.vertical as VerticalKey;
  const vertical = VERTICALS[key];
  if (!vertical) notFound();

  const tc = await getTranslations('catalog');
  const t = await getTranslations('demoLanding');
  const label = tc.has(`${key}.heroEyebrow`) ? tc(`${key}.heroEyebrow`) : vertical.hero.eyebrow;
  const features = tc.has(`${key}.features`)
    ? (tc.raw(`${key}.features`) as { title: string; desc: string }[])
    : vertical.features;

  const Icon = ICONS[key];
  const Mockup = MOCKUPS[key];
  const liveUrl = LIVE_PRODUCT_URL[key];

  // ── Accesso alla demo dal vivo SOLO con codice valido ──
  // Il prodotto reale si apre solo se il cliente arriva con un codice (riscattato
  // su /demo) di questo servizio e ancora nella finestra di validità. Senza codice
  // mostriamo l'anteprima + "Richiedi accesso demo" (il modello di business: il
  // codice lo mandiamo noi via WhatsApp dopo la richiesta).
  let hasValidCode = false;
  const code = typeof searchParams.code === 'string' ? searchParams.code.trim().toUpperCase() : '';
  if (code) {
    const admin = createSupabaseServiceClient();
    const { data: row } = await admin
      .from('demo_codes')
      .select('vertical, used_at, expires_at, kind')
      .eq('code', code)
      .maybeSingle();
    if (row && row.vertical === key && row.kind !== 'consultant') {
      const now = Date.now();
      hasValidCode = row.used_at
        ? new Date(row.used_at).getTime() + 12 * 60 * 60 * 1000 > now // 12h dall'avvio
        : new Date(row.expires_at).getTime() > now; // non ancora attivato ma valido
    }
  }
  const showLive = Boolean(liveUrl && hasValidCode);

  return (
    <>
      <section
        className="relative overflow-hidden pt-32 pb-12"
        style={{
          background: `
            radial-gradient(ellipse 55% 50% at 50% 0%, rgba(${vertical.accentRgb}, 0.18), transparent 70%),
            #f6f1e6`,
        }}
      >
        <div className="container-aala">
          <Link
            href={`/${params.locale}/demo`}
            className="mb-6 inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="h-3 w-3" /> {t('back')}
          </Link>

          <div className="mx-auto max-w-3xl text-center">
            <div
              className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: `rgba(${vertical.accentRgb}, 0.10)`,
                color: vertical.accent,
              }}
            >
              <Icon className="h-7 w-7" />
            </div>

            <p
              className="mt-6 text-xs font-medium uppercase tracking-[0.25em]"
              style={{ color: vertical.accent }}
            >
              {t('accessConfirmed')} · {label}
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight text-balance text-ink sm:text-6xl">
              {t.rich('inside', { gold: (c) => <span className="gold-text">{c}</span> })}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-ink-soft">
              {t.rich('previewOf', { product: label, b: (c) => <strong>{c}</strong> })}
              {liveUrl ? t('liveYes') : t('liveNo')}
            </p>

            {showLive ? (
              <div className="mt-10">
                <a
                  href={liveUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  {t('openLive')}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <div className="mt-10">
                <div className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-xl bg-canvas-soft px-4 py-3 text-sm text-ink-soft">
                  <Lock className="h-4 w-4 shrink-0" /> {t('needCode')}
                </div>
                <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href={`/${params.locale}/servizi/${vertical.slug}`} className="btn-primary">
                    {t('requestAccess')}
                  </Link>
                  <Link href={`/${params.locale}/demo`} className="btn-ghost">
                    {t('haveCode')}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-aala max-w-6xl">
          <div
            aria-hidden
            className="absolute left-1/2 -z-10 -mt-12 h-80 w-[60rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
            style={{ background: `rgba(${vertical.accentRgb}, 0.4)` }}
          />
          <Mockup />

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="card-paper p-6">
                <h3 className="font-display text-lg text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-canvas-soft p-8 text-center">
            <p className="text-xs uppercase tracking-widest text-ink-mute">{t('nextStep')}</p>
            <h2 className="mt-2 font-display text-3xl text-ink">{t('likedTitle')}</h2>
            <p className="mt-3 text-ink-soft">{t('likedSubtitle')}</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={`/${params.locale}/servizi/${vertical.slug}#prezzi`} className="btn-primary">
                {t('seePackages')}
              </Link>
              <Link href={`/${params.locale}/contatti`} className="btn-ghost">
                {t('talkToUs')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
