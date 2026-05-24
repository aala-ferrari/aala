import type { Metadata } from 'next';
import { DemoCodeForm } from './DemoCodeForm';

export const metadata: Metadata = {
  title: 'Accesso demo',
  description: 'Inserisci il codice ricevuto via email per accedere alla demo.',
};

export default function DemoEntryPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { code?: string };
}) {
  return (
    <section className="flex min-h-screen items-center justify-center pt-24 pb-16">
      <div className="container-aala max-w-md">
        <div className="card-paper p-8">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Accesso demo
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-ink">
            Hai un <span className="gold-text">codice?</span>
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            Inserisci il codice di 9 caratteri che ti abbiamo inviato. Funziona una
            sola volta ed è valido 7 giorni.
          </p>

          <div className="mt-8">
            <DemoCodeForm
              locale={params.locale}
              initialCode={searchParams.code}
              autoSubmit={Boolean(searchParams.code)}
            />
          </div>

          <div className="mt-8 border-t border-ink-line/70 pt-6 text-center">
            <p className="text-xs text-ink-soft">Non hai ancora un codice?</p>
            <a
              href={`/${params.locale}/contatti`}
              className="mt-2 inline-block text-sm font-medium text-gold hover:underline"
            >
              Richiedi accesso →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
