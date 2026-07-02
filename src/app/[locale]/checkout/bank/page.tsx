import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

// Sessione gateway bancario (placeholder professionale come i redirect delle banche).
// Quando ci sarà la API key della banca, qui si farà il redirect reale al PSP.
export default function BankSessionPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { plan?: string; total?: string; name?: string };
}) {
  const total = searchParams.total ? Number(searchParams.total) : null;
  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="card-paper p-7 text-center sm:p-9">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-gold/25 border-t-gold animate-spin" />
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">Pagamento sicuro</p>
          <h1 className="mt-3 font-display text-2xl">Connessione al gateway bancario…</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Stiamo aprendo la sessione di pagamento sicura per{searchParams.name ? ` ${searchParams.name}` : ''}.
            {searchParams.plan ? ` Pacchetto: ${searchParams.plan}.` : ''}
            {total ? ` Importo: € ${total}.` : ''}
          </p>

          <div className="mt-6 rounded-xl border border-ink-line bg-canvas-warm/40 p-4 text-left text-sm text-ink-soft">
            <p className="font-medium text-ink">Il tuo ordine è stato registrato ✓</p>
            <p className="mt-1">
              Il collegamento bancario per la carta è in fase di attivazione. Un nostro consulente
              conferma il pagamento e attiva il servizio nella tua area cliente. Riceverai una mail di conferma.
            </p>
          </div>

          <Link href={`/${params.locale}/account`} className="btn-primary mt-6 w-full justify-center">
            Vai all'area cliente
          </Link>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-mute">
            <ShieldCheck className="h-3.5 w-3.5" /> Connessione cifrata · dati protetti
          </p>
        </div>
      </div>
    </section>
  );
}
