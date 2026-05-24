import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Stethoscope, Car, Scale, Smile, ExternalLink, ArrowLeft } from 'lucide-react';
import { VERTICALS, type VerticalKey } from '@/lib/products';
import { MedicalMockup } from '@/components/mockups/MedicalMockup';
import { AutoMockup } from '@/components/mockups/AutoMockup';
import { LegalMockup } from '@/components/mockups/LegalMockup';
import { DentalMockup } from '@/components/mockups/DentalMockup';

const ICONS = { medical: Stethoscope, auto: Car, legal: Scale, dental: Smile };
const MOCKUPS = {
  medical: MedicalMockup,
  auto: AutoMockup,
  legal: LegalMockup,
  dental: DentalMockup,
};

// URL del prodotto vero (locale: tutti girano sul Mac).
const LIVE_PRODUCT_URL: Partial<Record<VerticalKey, string>> = {
  medical: 'http://localhost:4002',
  auto: 'http://localhost:4011',
  legal: 'http://localhost:5050',
  dental: 'https://medicalalbania.com',
};

export default function DemoLandingPage({
  params,
}: {
  params: { vertical: string; locale: string };
}) {
  const key = params.vertical as VerticalKey;
  const vertical = VERTICALS[key];
  if (!vertical) notFound();

  const Icon = ICONS[key];
  const Mockup = MOCKUPS[key];
  const liveUrl = LIVE_PRODUCT_URL[key];

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
            <ArrowLeft className="h-3 w-3" /> Codice
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
              Accesso confermato · {vertical.hero.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight text-balance text-ink sm:text-6xl">
              Sei <span className="gold-text">dentro</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-ink-soft">
              Stai vedendo l'anteprima di <strong>{vertical.hero.eyebrow}</strong>.
              {liveUrl
                ? ' Il prodotto è già online — clicca sotto per entrare nella demo dal vivo.'
                : " Il prodotto sarà disponibile in versione hostata a breve. Nel frattempo ti contatteremo per un onboarding personalizzato."}
            </p>

            {liveUrl && (
              <div className="mt-10">
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Apri demo dal vivo
                  <ExternalLink className="h-4 w-4" />
                </a>
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
            {vertical.features.map((f) => (
              <div key={f.title} className="card-paper p-6">
                <h3 className="font-display text-lg text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-canvas-soft p-8 text-center">
            <p className="text-xs uppercase tracking-widest text-ink-mute">Prossimo passo</p>
            <h2 className="mt-2 font-display text-3xl text-ink">
              Ti è piaciuto? Vedi i prezzi.
            </h2>
            <p className="mt-3 text-ink-soft">
              Scegli un piano oppure parla con noi per una soluzione su misura.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={`/${params.locale}/servizi/${vertical.slug}#prezzi`} className="btn-primary">
                Vedi pacchetti
              </Link>
              <Link href={`/${params.locale}/contatti`} className="btn-ghost">
                Parla con noi
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
