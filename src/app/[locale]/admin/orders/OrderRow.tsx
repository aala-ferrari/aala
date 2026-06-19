'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';
import { formatEur } from '@/lib/billing';
import { cn } from '@/lib/utils';

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-green-100 text-green-800',
  fulfilled: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

export function OrderRow({
  id,
  planName,
  email,
  fullName,
  amount,
  months,
  createdAt,
  status,
  readOnly,
}: {
  id: string;
  planName: string;
  email: string;
  fullName: string;
  amount: number;
  months: number;
  createdAt: string;
  status: string;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<null | 'confirm' | 'cancel'>(null);
  const [err, setErr] = useState<string | null>(null);

  async function act(action: 'confirm' | 'cancel') {
    setLoading(action);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Errore');
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Errore');
      setLoading(null);
    }
  }

  return (
    <div className="card-paper flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-ink">{planName}</p>
          <span className="text-xs text-ink-mute">· {months} {months === 1 ? 'mese' : 'mesi'}</span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              STATUS_STYLE[status] ?? 'bg-gray-100 text-gray-600'
            )}
          >
            {status}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-ink-soft">
          {fullName ? `${fullName} · ` : ''}{email}
        </p>
        <p className="text-xs text-ink-mute">{createdAt?.slice(0, 16).replace('T', ' ')}</p>
        {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      </div>

      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        <span className="font-display text-2xl text-ink">€ {formatEur(amount)}</span>
        {!readOnly && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => act('confirm')}
              disabled={loading !== null}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-ink transition hover:brightness-105 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#ecdcb0,#c9a849,#a07a26)' }}
            >
              {loading === 'confirm' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Conferma
            </button>
            <button
              type="button"
              onClick={() => act('cancel')}
              disabled={loading !== null}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink-line px-3 py-2 text-sm text-ink-soft transition hover:border-red-300 hover:text-red-600 disabled:opacity-60"
            >
              {loading === 'cancel' ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
