'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check, CreditCard, Handshake, ShieldCheck, Loader2 } from 'lucide-react';
import {
  DURATIONS,
  priceForDuration,
  discountLabel,
  formatEur,
  DEFAULT_DURATION_MONTHS,
} from '@/lib/billing';
import { cn } from '@/lib/utils';

type PlanInfo = {
  id: string;
  name: string;
  price: number;
  billing: 'one-time' | 'monthly' | 'yearly' | 'contact';
};

export function CheckoutConfigurator({
  locale,
  plan,
  vertical,
}: {
  locale: string;
  plan: PlanInfo;
  vertical: { key: string; label: string; accent: string };
}) {
  const t = useTranslations('checkout');
  const hasDuration = plan.billing === 'monthly';
  const [months, setMonths] = useState<number>(DEFAULT_DURATION_MONTHS);
  const [loading, setLoading] = useState<null | 'card' | 'manual'>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const breakdown = hasDuration ? priceForDuration(plan.price, months) : null;
  const total = breakdown ? breakdown.total : plan.price;
  // etichetta durata tradotta (1 mese / 3 mesi / 6 mesi / 1 anno)
  const durLabel = (m: number) => t(`m${m}` as 'm1' | 'm3' | 'm6' | 'm12');
  const monthsLabel = (m: number) => t('months', { count: m });

  async function payCard() {
    setLoading('card');
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, locale, months: hasDuration ? months : undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? t('errCheckout'));
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('err'));
      setLoading(null);
    }
  }

  async function orderManual() {
    setLoading('manual');
    setError(null);
    try {
      const res = await fetch('/api/order/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, months: hasDuration ? months : undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? t('errOrder'));
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('err'));
      setLoading(null);
    }
  }

  // ── Schermata di conferma (ordine assistito creato) ──
  if (done) {
    return (
      <section className="flex min-h-screen items-start justify-center px-4 pt-28 pb-28 sm:items-center">
        <div className="card-paper w-full max-w-md p-7 text-center sm:p-9">
          <div
            className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: `rgba(${hexToRgb(vertical.accent)}, 0.12)`, color: vertical.accent }}
          >
            <Check className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-display text-2xl sm:text-3xl">{t('doneTitle')}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {t('doneBody', {
              plan: `${plan.name}${hasDuration ? ` · ${monthsLabel(months)}` : ''}`,
            })}
          </p>
          <div className="mt-5 rounded-xl bg-canvas-warm/50 p-4">
            <p className="text-xs uppercase tracking-widest text-ink-mute">{t('total')}</p>
            <p className="mt-1 font-display text-3xl">€ {formatEur(total)}</p>
          </div>
          <Link
            href={`/${locale}/account`}
            className="btn-primary mt-6 w-full justify-center"
          >
            {t('doneCta')}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen items-start justify-center px-4 pt-28 pb-28 sm:pt-32">
      <div className="w-full max-w-lg">
        <p className="text-xs uppercase tracking-widest text-ink-mute">{t('eyebrow')} · {vertical.label}</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">{plan.name}</h1>

        {/* Durata (solo abbonamenti) */}
        {hasDuration && (
          <div className="mt-8">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-ink-mute">
              {t('chooseDuration')}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DURATIONS.map((d) => {
                const b = priceForDuration(plan.price, d.months);
                const active = months === d.months;
                const off = discountLabel(d.months);
                return (
                  <button
                    key={d.months}
                    type="button"
                    onClick={() => setMonths(d.months)}
                    className={cn(
                      'relative rounded-xl border p-3 text-center transition',
                      active
                        ? 'border-gold bg-gold/10 shadow-sm'
                        : 'border-ink-line bg-white hover:border-gold/50'
                    )}
                  >
                    {off && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-ink">
                        {off}
                      </span>
                    )}
                    <span className="block text-sm font-semibold text-ink">{durLabel(d.months)}</span>
                    <span className="mt-1 block text-xs text-ink-soft">€ {formatEur(b.total)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Riepilogo prezzo */}
        <div className="card-paper mt-8 p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ink-soft">
              {hasDuration ? monthsLabel(months) : t('total')}
            </span>
            <span className="font-display text-3xl">€ {formatEur(total)}</span>
          </div>
          {breakdown && breakdown.saved > 0 && (
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-ink-mute line-through">€ {formatEur(breakdown.fullTotal)}</span>
              <span className="font-semibold text-green-700">
                {t('save', { amount: `€ ${formatEur(breakdown.saved)}`, off: discountLabel(months) })}
              </span>
            </div>
          )}
          {hasDuration && (
            <p className="mt-3 text-xs text-ink-mute">
              {t('perMonth', { amount: `€ ${formatEur(breakdown!.effectiveMonthly)}` })}
            </p>
          )}
        </div>

        {/* Metodi di pagamento */}
        <div className="mt-8 space-y-3">
          <p className="text-sm font-medium uppercase tracking-widest text-ink-mute">{t('howToPay')}</p>

          <button
            type="button"
            onClick={payCard}
            disabled={loading !== null}
            className="flex w-full items-center gap-4 rounded-xl border border-ink-line bg-white p-4 text-left transition hover:border-gold disabled:opacity-60"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold">
              {loading === 'card' ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-ink">{t('payCard')}</span>
              <span className="block text-xs text-ink-soft">{t('payCardDesc')}</span>
            </span>
          </button>

          <button
            type="button"
            onClick={orderManual}
            disabled={loading !== null}
            className="flex w-full items-center gap-4 rounded-xl border border-ink-line bg-white p-4 text-left transition hover:border-gold disabled:opacity-60"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold">
              {loading === 'manual' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Handshake className="h-5 w-5" />}
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-ink">{t('payManual')}</span>
              <span className="block text-xs text-ink-soft">{t('payManualDesc')}</span>
            </span>
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-mute">
          <ShieldCheck className="h-3.5 w-3.5" /> {t('secure')}
        </p>
      </div>
    </section>
  );
}

function hexToRgb(hex: string): string {
  const m = hex.replace('#', '').match(/.{1,2}/g);
  if (!m) return '201, 168, 73';
  return m.map((x) => parseInt(x, 16)).join(', ');
}
