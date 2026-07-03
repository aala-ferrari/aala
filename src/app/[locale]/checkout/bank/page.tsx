import Link from 'next/link';
import { ShieldCheck, Check, XCircle } from 'lucide-react';

// Pagina esito / sessione gateway bancario.
// ?status=ok    → pagamento riuscito (dopo Credins 3D Secure)
// ?status=fail  → pagamento rifiutato
// ?status=error → errore/firma non valida
// (nessuno)     → placeholder "ordine registrato" (gateway non ancora attivo)
export default function BankSessionPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { plan?: string; total?: string; name?: string; status?: string };
}) {
  const total = searchParams.total ? Number(searchParams.total) : null;
  const status = searchParams.status;

  if (status === 'ok') {
    return (
      <Shell>
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700"><Check className="h-7 w-7" /></div>
        <h1 className="font-display text-2xl">Pagamento riuscito ✓</h1>
        <p className="mt-3 text-sm text-ink-soft">Grazie! Il pagamento con carta è stato approvato dalla banca. Il servizio viene attivato nella tua area cliente. Riceverai una mail di conferma.</p>
        <Link href={`/${params.locale}/account`} className="btn-primary mt-6 w-full justify-center">Vai all'area cliente</Link>
      </Shell>
    );
  }

  if (status === 'fail' || status === 'error') {
    return (
      <Shell>
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600"><XCircle className="h-7 w-7" /></div>
        <h1 className="font-display text-2xl">Pagamento non riuscito</h1>
        <p className="mt-3 text-sm text-ink-soft">{status === 'error' ? 'Si è verificato un problema con la sessione di pagamento.' : 'La banca ha rifiutato il pagamento (carta, fondi o 3D Secure).'} Nessun addebito è stato effettuato. Puoi riprovare o scegliere un altro metodo.</p>
        <Link href={`/${params.locale}/prezzi`} className="btn-primary mt-6 w-full justify-center">Riprova</Link>
      </Shell>
    );
  }

  // Placeholder: gateway non ancora attivo (ordine registrato come pending).
  return (
    <Shell>
      <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-gold/25 border-t-gold animate-spin" />
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">Pagamento sicuro</p>
      <h1 className="mt-3 font-display text-2xl">Ordine registrato ✓</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Grazie{searchParams.name ? ` ${searchParams.name}` : ''}!{searchParams.plan ? ` Pacchetto: ${searchParams.plan}.` : ''}{total ? ` Importo: € ${total}.` : ''}
      </p>
      <div className="mt-6 rounded-xl border border-ink-line bg-canvas-warm/40 p-4 text-left text-sm text-ink-soft">
        <p className="font-medium text-ink">Il collegamento bancario per la carta è in fase di attivazione.</p>
        <p className="mt-1">Un nostro consulente conferma il pagamento e attiva il servizio nella tua area cliente. Riceverai una mail di conferma.</p>
      </div>
      <Link href={`/${params.locale}/account`} className="btn-primary mt-6 w-full justify-center">Vai all'area cliente</Link>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="card-paper p-7 text-center sm:p-9">
          {children}
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-mute">
            <ShieldCheck className="h-3.5 w-3.5" /> Connessione cifrata · dati carta protetti dalla banca
          </p>
        </div>
      </div>
    </section>
  );
}
