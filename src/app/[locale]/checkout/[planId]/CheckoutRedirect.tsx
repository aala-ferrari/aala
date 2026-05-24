'use client';

import { useEffect, useState } from 'react';

export function CheckoutRedirect({
  planId,
  planName,
  locale,
}: {
  planId: string;
  planName: string;
  locale: string;
}) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId, locale }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Errore checkout');
        if (!cancelled) window.location.href = json.url;
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Errore');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [planId, locale]);

  return (
    <section className="flex min-h-screen items-center justify-center pt-24">
      <div className="card-paper max-w-md p-10 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
        <h1 className="mt-6 font-display text-2xl">Preparo il checkout...</h1>
        <p className="mt-2 text-sm text-ink-soft">{planName}</p>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      </div>
    </section>
  );
}
