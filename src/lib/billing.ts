// ──────────────────────────────────────────────────────────────
// Durate di abbonamento + sconti (per i piani 'monthly').
// Regola decisa con il cliente:
//   1 mese  → prezzo pieno
//   3 mesi  → prezzo pieno
//   6 mesi  → −10%
//   12 mesi → −15%
// I piani 'one-time' / 'contact' NON usano le durate.
// ──────────────────────────────────────────────────────────────

export interface DurationOption {
  months: number;
  discount: number; // frazione: 0.10 = 10%
  /** chiave i18n del label (billing.duration.*) con fallback testuale */
  key: string;
  fallback: string;
}

export const DURATIONS: DurationOption[] = [
  { months: 1, discount: 0, key: 'm1', fallback: '1 mese' },
  { months: 3, discount: 0, key: 'm3', fallback: '3 mesi' },
  { months: 6, discount: 0.1, key: 'm6', fallback: '6 mesi' },
  { months: 12, discount: 0.15, key: 'm12', fallback: '1 anno' },
];

export const DEFAULT_DURATION_MONTHS = 1;

/** Durate ammesse (mesi). Qualsiasi altro valore va rifiutato lato server. */
export const VALID_MONTHS = DURATIONS.map((d) => d.months);

/** True se `m` è una durata vendibile (1/3/6/12). */
export function isValidMonths(m: unknown): m is number {
  return typeof m === 'number' && Number.isInteger(m) && VALID_MONTHS.includes(m);
}

export interface PriceBreakdown {
  months: number;
  discount: number; // frazione applicata
  monthlyBase: number; // prezzo mensile di listino
  fullTotal: number; // mesi × prezzo, senza sconto
  total: number; // totale effettivo da pagare (intero, arrotondato)
  saved: number; // quanto risparmia rispetto al pieno
  effectiveMonthly: number; // prezzo mensile equivalente dopo sconto (arrotondato)
}

/** Calcola il prezzo totale per una durata, applicando lo sconto previsto. */
export function priceForDuration(monthlyBase: number, months: number): PriceBreakdown {
  const opt = DURATIONS.find((d) => d.months === months) ?? DURATIONS[0];
  const fullTotal = monthlyBase * opt.months;
  const total = Math.round(fullTotal * (1 - opt.discount));
  return {
    months: opt.months,
    discount: opt.discount,
    monthlyBase,
    fullTotal,
    total,
    saved: fullTotal - total,
    effectiveMonthly: Math.round(total / opt.months),
  };
}

/** Etichetta sconto, es. "-10%". Stringa vuota se nessuno sconto. */
export function discountLabel(months: number): string {
  const opt = DURATIONS.find((d) => d.months === months);
  return opt && opt.discount > 0 ? `−${Math.round(opt.discount * 100)}%` : '';
}

/** Formatta un importo intero in EUR con separatore delle migliaia (it-IT). */
export function formatEur(amount: number): string {
  return new Intl.NumberFormat('it-IT').format(amount);
}
