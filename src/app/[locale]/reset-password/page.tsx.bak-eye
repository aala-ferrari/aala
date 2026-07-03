'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      setStep('code');
    } catch { setError('Errore di rete. Riprova.'); } finally { setLoading(false); }
  }

  async function doReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== password2) { setError('Le password non coincidono'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code, password }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Errore');
      setOk(true);
      setTimeout(() => router.push(`/${locale}/login`), 2200);
    } catch (err) { setError(err instanceof Error ? err.message : 'Errore'); } finally { setLoading(false); }
  }

  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="card-paper p-6 sm:p-8">
          <h1 className="font-display text-2xl sm:text-3xl text-ink">Password dimenticata</h1>

          {ok ? (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              ✓ Password reimpostata! Ti reindirizzo al login…
            </div>
          ) : step === 'email' ? (
            <>
              <p className="mt-2 text-sm text-ink-soft">Inserisci la tua email: ti invieremo un codice a 6 cifre per reimpostare la password.</p>
              <form onSubmit={requestCode} className="mt-8 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink-mute">Email</span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-ink-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold" />
                </label>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">{loading ? 'Invio…' : 'Invia codice'}</button>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </form>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-ink-soft">Abbiamo inviato un codice a <b>{email}</b>. Inseriscilo qui e scegli la nuova password.</p>
              <form onSubmit={doReset} className="mt-8 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink-mute">Codice a 6 cifre</span>
                  <input inputMode="numeric" required value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} placeholder="123456"
                    className="w-full rounded-lg border border-ink-line bg-white px-4 py-3 text-center text-lg tracking-[0.4em] text-ink outline-none focus:border-gold" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink-mute">Nuova password (min 8)</span>
                  <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-ink-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink-mute">Ripeti password</span>
                  <input type="password" required minLength={8} value={password2} onChange={(e) => setPassword2(e.target.value)}
                    className="w-full rounded-lg border border-ink-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold" />
                </label>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">{loading ? 'Salvataggio…' : 'Reimposta password'}</button>
                <button type="button" onClick={() => { setStep('email'); setError(null); }} className="w-full text-center text-xs text-ink-mute hover:text-ink">← Cambia email</button>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </form>
            </>
          )}

          <div className="mt-6 text-center text-sm text-ink-soft">
            <Link href={`/${locale}/login`} className="text-gold hover:underline">← Torna al login</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
