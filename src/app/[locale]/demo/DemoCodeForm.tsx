'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, ArrowRight, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Labels {
  placeholder: string;
  submit: string;
  verifying: string;
  openingProduct: string;
  fallbackLink: string;
}

export function DemoCodeForm({
  locale,
  initialCode,
  autoSubmit,
  labels,
}: {
  locale: string;
  initialCode?: string;
  autoSubmit?: boolean;
  labels: Labels;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState(initialCode?.toUpperCase() ?? '');
  const [redirecting, setRedirecting] = useState<string | null>(null);

  const submit = useCallback(
    async (code: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/demo/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Errore');

        if (json.external) {
          setRedirecting(json.redirectTo);
          window.location.href = json.redirectTo;
        } else {
          router.push(`/${locale}${json.redirectTo}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore');
        setLoading(false);
      }
    },
    [locale, router]
  );

  useEffect(() => {
    if (autoSubmit && initialCode && initialCode.length >= 4) {
      submit(initialCode.toUpperCase());
    } else {
      inputRef.current?.focus();
    }
  }, [autoSubmit, initialCode, submit]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(value);
  }

  if (redirecting) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
        <p className="text-sm text-ink-soft">{labels.openingProduct}</p>
        <a href={redirecting} className="inline-flex items-center gap-1 text-xs text-gold hover:underline">
          {labels.fallbackLink} <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value.toUpperCase())}
        placeholder={labels.placeholder}
        maxLength={20}
        className="w-full rounded-xl border border-ink-line bg-white px-5 py-4 text-center font-mono text-2xl font-bold tracking-[0.2em] text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
      />

      <button
        type="submit"
        disabled={loading || value.length < 4}
        className={cn(
          'btn-primary w-full justify-center',
          (loading || value.length < 4) && 'opacity-60'
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {labels.verifying}
          </>
        ) : (
          <>
            {labels.submit} <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}
