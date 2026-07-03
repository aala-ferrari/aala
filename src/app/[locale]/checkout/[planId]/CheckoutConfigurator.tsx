'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check, CreditCard, Handshake, ShieldCheck, Loader2, ChevronDown } from 'lucide-react';
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

// Prefissi internazionali con bandiera (i più usati per l'Albania + Europa + mondo).
const COUNTRIES = [
  { c: 'AL', flag: '🇦🇱', dial: '+355', name: 'Shqipëri' },
  { c: 'IT', flag: '🇮🇹', dial: '+39', name: 'Italia' },
  { c: 'XK', flag: '🇽🇰', dial: '+383', name: 'Kosovë' },
  { c: 'MK', flag: '🇲🇰', dial: '+389', name: 'Maqedonia e V.' },
  { c: 'GR', flag: '🇬🇷', dial: '+30', name: 'Greqi' },
  { c: 'ME', flag: '🇲🇪', dial: '+382', name: 'Mal i Zi' },
  { c: 'DE', flag: '🇩🇪', dial: '+49', name: 'Gjermani' },
  { c: 'CH', flag: '🇨🇭', dial: '+41', name: 'Zvicër' },
  { c: 'FR', flag: '🇫🇷', dial: '+33', name: 'Francë' },
  { c: 'GB', flag: '🇬🇧', dial: '+44', name: 'UK' },
  { c: 'US', flag: '🇺🇸', dial: '+1', name: 'USA / Canada' },
  { c: 'ES', flag: '🇪🇸', dial: '+34', name: 'Spanjë' },
  { c: 'BE', flag: '🇧🇪', dial: '+32', name: 'Belgjikë' },
  { c: 'NL', flag: '🇳🇱', dial: '+31', name: 'Holandë' },
  { c: 'AT', flag: '🇦🇹', dial: '+43', name: 'Austri' },
  { c: 'SE', flag: '🇸🇪', dial: '+46', name: 'Suedi' },
  { c: 'TR', flag: '🇹🇷', dial: '+90', name: 'Turqi' },
];

function CountrySelect({ value, onChange }: { value: typeof COUNTRIES[number]; onChange: (c: typeof COUNTRIES[number]) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const list = COUNTRIES.filter((c) => `${c.name} ${c.dial} ${c.c}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="flex h-full items-center gap-1.5 rounded-l-lg border border-r-0 border-ink-line bg-white px-3 py-3 text-sm text-ink outline-none hover:border-gold">
        <span className="text-base">{value.flag}</span>
        <span className="font-medium">{value.dial}</span>
        <ChevronDown className="h-3.5 w-3.5 text-ink-mute" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-64 overflow-auto rounded-xl border border-ink-line bg-white shadow-xl">
            <div className="sticky top-0 bg-white p-2">
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca paese…"
                className="w-full rounded-lg border border-ink-line px-2.5 py-1.5 text-sm outline-none focus:border-gold" />
            </div>
            {list.map((c) => (
              <button key={c.c} type="button" onClick={() => { onChange(c); setOpen(false); setQ(''); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-canvas-warm/60">
                <span className="text-base">{c.flag}</span>
                <span className="flex-1 text-ink">{c.name}</span>
                <span className="text-ink-mute">{c.dial}</span>
              </button>
            ))}
            {list.length === 0 && <p className="px-3 py-3 text-sm text-ink-mute">Nessun paese</p>}
          </div>
        </>
      )}
    </div>
  );
}

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

  // Form dati cliente per pagamento con carta (gateway bancario)
  const [showCard, setShowCard] = useState(false);
  const [cust, setCust] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [country, setCountry] = useState(COUNTRIES[0]);

  const breakdown = hasDuration ? priceForDuration(plan.price, months) : null;
  const total = breakdown ? breakdown.total : plan.price;
  const durLabel = (m: number) => t(`m${m}` as 'm1' | 'm3' | 'm6' | 'm12');
  const monthsLabel = (m: number) => t('months', { count: m });

  async function payNowBank(e: React.FormEvent) {
    e.preventDefault();
    setLoading('card');
    setError(null);
    try {
      const res = await fetch('/api/checkout/credins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          months: hasDuration ? months : undefined,
          customer: {
            firstName: cust.firstName,
            lastName: cust.lastName,
            email: cust.email,
            phone: `${country.dial} ${cust.phone}`.trim(),
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? t('errOrder'));

      // Gateway Credins attivo → POST del form al 3D Secure della banca.
      if (json.configured && json.action && json.fields) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = json.action;
        Object.entries(json.fields as Record<string, string>).forEach(([k, v]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = String(v);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }

      // Gateway non ancora attivo → placeholder (ordine già registrato come pending).
      const qs = new URLSearchParams({
        plan: plan.name,
        total: String(total),
        name: `${cust.firstName} ${cust.lastName}`.trim(),
      });
      window.location.href = `/${locale}/checkout/bank?${qs.toString()}`;
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

  if (done) {
    return (
      <section className="flex min-h-screen items-start justify-center px-4 pt-28 pb-28 sm:items-center">
        <div className="card-paper w-full max-w-md p-7 text-center sm:p-9">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: `rgba(${hexToRgb(vertical.accent)}, 0.12)`, color: vertical.accent }}>
            <Check className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-display text-2xl sm:text-3xl">{t('doneTitle')}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {t('doneBody', { plan: `${plan.name}${hasDuration ? ` · ${monthsLabel(months)}` : ''}` })}
          </p>
          <div className="mt-5 rounded-xl bg-canvas-warm/50 p-4">
            <p className="text-xs uppercase tracking-widest text-ink-mute">{t('total')}</p>
            <p className="mt-1 font-display text-3xl">€ {formatEur(total)}</p>
          </div>
          <Link href={`/${locale}/account`} className="btn-primary mt-6 w-full justify-center">{t('doneCta')}</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen items-start justify-center px-4 pt-28 pb-28 sm:pt-32">
      <div className="w-full max-w-lg">
        <p className="text-xs uppercase tracking-widest text-ink-mute">{t('eyebrow')} · {vertical.label}</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">{plan.name}</h1>

        {hasDuration && (
          <div className="mt-8">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-ink-mute">{t('chooseDuration')}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DURATIONS.map((d) => {
                const b = priceForDuration(plan.price, d.months);
                const active = months === d.months;
                const off = discountLabel(d.months);
                return (
                  <button key={d.months} type="button" onClick={() => setMonths(d.months)}
                    className={cn('relative rounded-xl border p-3 text-center transition',
                      active ? 'border-gold bg-gold/10 shadow-sm' : 'border-ink-line bg-white hover:border-gold/50')}>
                    {off && <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-ink">{off}</span>}
                    <span className="block text-sm font-semibold text-ink">{durLabel(d.months)}</span>
                    <span className="mt-1 block text-xs text-ink-soft">€ {formatEur(b.total)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="card-paper mt-8 p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ink-soft">{hasDuration ? monthsLabel(months) : t('total')}</span>
            <span className="font-display text-3xl">€ {formatEur(total)}</span>
          </div>
          {breakdown && breakdown.saved > 0 && (
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-ink-mute line-through">€ {formatEur(breakdown.fullTotal)}</span>
              <span className="font-semibold text-green-700">{t('save', { amount: `€ ${formatEur(breakdown.saved)}`, off: discountLabel(months) })}</span>
            </div>
          )}
          {hasDuration && <p className="mt-3 text-xs text-ink-mute">{t('perMonth', { amount: `€ ${formatEur(breakdown!.effectiveMonthly)}` })}</p>}
        </div>

        {!showCard ? (
          <div className="mt-8 space-y-3">
            <p className="text-sm font-medium uppercase tracking-widest text-ink-mute">{t('howToPay')}</p>
            <button type="button" onClick={() => { setError(null); setShowCard(true); }} disabled={loading !== null}
              className="flex w-full items-center gap-4 rounded-xl border border-ink-line bg-white p-4 text-left transition hover:border-gold disabled:opacity-60">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold"><CreditCard className="h-5 w-5" /></span>
              <span className="flex-1">
                <span className="block font-semibold text-ink">{t('payCard')}</span>
                <span className="block text-xs text-ink-soft">{t('payCardDesc')}</span>
              </span>
            </button>
            <button type="button" onClick={orderManual} disabled={loading !== null}
              className="flex w-full items-center gap-4 rounded-xl border border-ink-line bg-white p-4 text-left transition hover:border-gold disabled:opacity-60">
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
        ) : (
          <form onSubmit={payNowBank} className="card-paper mt-8 p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gold" />
              <h2 className="font-display text-lg text-ink">Dati per il pagamento</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block"><span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-ink-mute">Nome</span>
                <input required value={cust.firstName} onChange={(e) => setCust({ ...cust, firstName: e.target.value })} className="w-full rounded-lg border border-ink-line bg-white px-3 py-3 text-sm outline-none focus:border-gold" /></label>
              <label className="block"><span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-ink-mute">Cognome</span>
                <input required value={cust.lastName} onChange={(e) => setCust({ ...cust, lastName: e.target.value })} className="w-full rounded-lg border border-ink-line bg-white px-3 py-3 text-sm outline-none focus:border-gold" /></label>
            </div>
            <label className="mt-3 block"><span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-ink-mute">Email</span>
              <input required type="email" value={cust.email} onChange={(e) => setCust({ ...cust, email: e.target.value })} className="w-full rounded-lg border border-ink-line bg-white px-3 py-3 text-sm outline-none focus:border-gold" /></label>
            <label className="mt-3 block"><span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-ink-mute">Telefono</span>
              <div className="flex">
                <CountrySelect value={country} onChange={setCountry} />
                <input required type="tel" value={cust.phone} onChange={(e) => setCust({ ...cust, phone: e.target.value.replace(/[^0-9 ]/g, '') })} placeholder="69 123 4567"
                  className="w-full rounded-r-lg border border-ink-line bg-white px-3 py-3 text-sm outline-none focus:border-gold" />
              </div>
            </label>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading !== null} className="btn-primary mt-5 w-full justify-center">
              {loading === 'card' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reindirizzamento…</> : `Paga adesso · € ${formatEur(total)}`}
            </button>
            <button type="button" onClick={() => setShowCard(false)} className="mt-2 w-full text-center text-xs text-ink-mute hover:text-ink">← Torna ai metodi di pagamento</button>
          </form>
        )}

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
