'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Sparkles, Brain, Lock, ArrowLeft, Mic, Volume2, VolumeX } from 'lucide-react';
import { BOLLA_COLORS, type BollaMood } from '@/lib/bolla-brain';
import { useVoice } from '@/lib/use-voice';
import { cn } from '@/lib/utils';

const BollaScene3D = dynamic(
  () => import('./BollaScene3D').then((m) => m.BollaScene3D),
  { ssr: false }
);

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

interface ApiReply {
  source: string;
  reply: string;
  service: string | null;
  chips: string[];
  chipActions?: string[];
  whatsapp?: boolean;
}

type ConsultSession = {
  code: string;
  tier: 'smart' | 'medium' | 'max' | 'unlimited';
  remaining: number;
  documents: boolean;
  unlimited: boolean;
};

const WHATSAPP_NUMBER = '355699555777';
const SERVICE_LABELS: Record<string, string> = {
  medical: 'il CRM Medical',
  auto: 'il Gestionale Auto',
  legal: 'Super Avokati',
  dental: 'il Dental Tourism',
  taxi: 'la Taxi App',
  webpages: 'un sito web su misura',
};

function openWhatsApp(service: string | null, text?: string) {
  const what = service && SERVICE_LABELS[service] ? SERVICE_LABELS[service] : 'i vostri servizi';
  const msg = text ?? `Ciao AALA! Ho parlato con la Bolla sul sito e vorrei più informazioni / una demo su ${what}.`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function BollaAssistant({ onClose }: { onClose: () => void }) {
  const t = useTranslations('bolla');
  const tc = useTranslations('bolla.consultant');
  const locale = useLocale();

  const welcomeChips = [
    t('chips.medical'),
    t('chips.legal'),
    t('chips.auto'),
    t('chips.dental'),
    t('chips.taxi'),
    t('chips.webpages'),
  ];

  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: t('welcome') },
  ]);
  const [chips, setChips] = useState<string[]>(welcomeChips);
  const [mood, setMood] = useState<BollaMood>('idle');
  const [color, setColor] = useState(BOLLA_COLORS.default);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [currentService, setCurrentService] = useState<string | null>(null);

  // ── Super Consulente ──
  const [mode, setMode] = useState<'bolla' | 'consultant'>('bolla');
  const [gate, setGate] = useState<null | 'menu' | 'request'>(null);
  const [consult, setConsult] = useState<ConsultSession | null>(null);
  const [exhausted, setExhausted] = useState(false);

  // ── Voce: parla invece di scrivere, e ascolta le risposte (mani libere) ──
  const voice = useVoice(locale);
  const [voiceOut, setVoiceOut] = useState(false); // leggere a voce le risposte?

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || busy) return;

      // chip WhatsApp → apri la chat con messaggio precompilato
      if (clean.toLowerCase().includes('whatsapp')) {
        openWhatsApp(currentService);
        return;
      }

      const nextMsgs: Msg[] = [...messages, { role: 'user', content: clean }];
      setMessages(nextMsgs);
      setInput('');
      setChips([]);
      setBusy(true);
      setMood('thinking');

      try {
        if (mode === 'consultant' && consult) {
          // ── modalità Super Consulente ──
          const res = await fetch('/api/consulente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: consult.code, messages: nextMsgs, locale }),
          });
          const data = await res.json();

          if (!data.ok) {
            // esaurito / scaduto → upsell WhatsApp
            const reason = data.reason as string;
            const msg = reason === 'expired' ? tc('expired') : tc('exhausted');
            setMessages((m) => [...m, { role: 'assistant', content: msg }]);
            if (voiceOut) voice.speak(msg);
            setChips(['📱 Scrivici su WhatsApp']);
            setConsult((c) => (c ? { ...c, remaining: 0 } : c));
            setExhausted(true);
            setMood('idle');
            return;
          }

          if (data.service && BOLLA_COLORS[data.service]) setColor(BOLLA_COLORS[data.service]);
          if (data.service) setCurrentService(data.service);
          setMood('speaking');
          setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
          if (voiceOut) voice.speak(data.reply);
          setChips(data.chips ?? []);
          setConsult((c) =>
            c
              ? {
                  ...c,
                  remaining: data.remaining ?? c.remaining,
                  unlimited: data.unlimited ?? c.unlimited,
                }
              : c
          );
          if (!data.unlimited && (data.remaining ?? 1) <= 0) setExhausted(true);
          setTimeout(() => setMood('idle'), 2600);
          return;
        }

        // ── modalità Bolla normale ──
        const res = await fetch('/api/bolla', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: nextMsgs, locale }),
        });
        const data: ApiReply = await res.json();

        if (data.service && BOLLA_COLORS[data.service]) setColor(BOLLA_COLORS[data.service]);
        if (data.service) setCurrentService(data.service);

        setMood('speaking');
        setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
        if (voiceOut) voice.speak(data.reply);
        setChips(data.chips ?? []);
        setTimeout(() => setMood('idle'), 2600);
      } catch {
        setMessages((m) => [...m, { role: 'assistant', content: t('error') }]);
        setMood('idle');
      } finally {
        setBusy(false);
      }
    },
    [messages, busy, currentService, locale, t, tc, mode, consult, voiceOut, voice]
  );

  // 🎤 premi e parla: ascolta la voce, riempie e invia. Attiva anche la voce in uscita.
  const handleMic = useCallback(() => {
    if (voice.listening) {
      voice.stopListening();
      return;
    }
    voice.unlock(); // sblocca il motore TTS durante questo gesto
    setVoiceOut(true); // mani libere → leggi le risposte a voce
    voice.startListening((text) => {
      setInput(text);
      send(text);
    });
  }, [voice, send]);

  // la sfera "ascolta" (morffa) mentre il microfono è attivo
  useEffect(() => {
    if (voice.listening) setMood('thinking');
    else if (!busy) setMood((m) => (m === 'thinking' ? 'idle' : m));
  }, [voice.listening, busy]);

  // accendi/spegni la voce in uscita. Accendendola, legge SUBITO l'ultima
  // risposta (il click è un gesto utente → sblocca l'audio del browser).
  const toggleVoiceOut = useCallback(() => {
    if (voiceOut) {
      voice.cancelSpeak();
      setVoiceOut(false);
    } else {
      voice.unlock(); // sblocca il motore TTS in questo gesto
      setVoiceOut(true);
      const last = [...messages].reverse().find((m) => m.role === 'assistant');
      if (last) voice.speak(last.content);
    }
  }, [voice, voiceOut, messages]);

  // sblocca il consulente con un codice valido
  const onUnlock = useCallback(
    (session: ConsultSession) => {
      setConsult(session);
      setMode('consultant');
      setGate(null);
      setExhausted(false);
      setCurrentService(null);
      setColor(BOLLA_COLORS.legal);
      setMessages([{ role: 'assistant', content: tc('welcome') }]);
      setChips([]);
    },
    [tc]
  );

  const tierLabel = consult ? tc(`tierName.${consult.tier}`) : '';
  const inputDisabled = busy || (mode === 'consultant' && exhausted);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-h-[80vh] w-auto max-w-md flex-col overflow-hidden rounded-3xl sm:inset-x-auto sm:left-6 sm:bottom-6 sm:mx-0 sm:w-[400px]"
      style={{
        background: 'linear-gradient(180deg, #fbf8f0 0%, #f6f1e6 100%)',
        boxShadow: '0 30px 80px -20px rgba(15,25,42,0.35), 0 0 0 1px rgba(231,224,207,0.9)',
      }}
    >
      {/* ── Header con la Bolla 3D viva ── */}
      <div className="relative shrink-0 overflow-hidden px-5 pt-5 pb-3">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(ellipse 70% 90% at 30% 0%, ${color}22, transparent 60%)`,
          }}
        />
        <div className="flex items-center gap-3">
          <div
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full"
            style={{ boxShadow: `inset 0 0 0 1px ${color}33` }}
          >
            <BollaScene3D mood={mood} color={color} />
          </div>
          <div className="flex-1">
            <p className="flex items-center gap-1.5 font-display text-lg leading-tight text-ink">
              {mode === 'consultant' ? tc('badge') : t('title')}
              {mode === 'consultant' ? (
                <Brain className="h-3.5 w-3.5 text-gold" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-gold" />
              )}
            </p>
            <p className="text-xs text-ink-soft">
              {mode === 'consultant' && consult
                ? consult.unlimited
                  ? `${tierLabel} · ${tc('questionsUnlimited')}`
                  : `${tierLabel} · ${tc('questionsLeft', { n: Math.max(0, consult.remaining) })}`
                : mood === 'thinking'
                  ? t('statusThinking')
                  : t('statusIdle')}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Chiudi"
            className="rounded-full p-1.5 text-ink-mute transition hover:bg-canvas-warm hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CTA Super Consulente — solo in modalità Bolla */}
        {mode === 'bolla' && !gate && (
          <button
            onClick={() => setGate('menu')}
            className="group mt-3 flex w-full items-center gap-2.5 rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/10 to-transparent px-3.5 py-2.5 text-left transition hover:border-gold hover:from-gold/15"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(135deg,#ecdcb0,#c9a849,#8a6717)' }}
            >
              <Brain className="h-4 w-4 text-ink" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-ink">{tc('open')}</span>
              <span className="block text-[11px] leading-tight text-ink-soft">{tc('openSub')}</span>
            </span>
            <Lock className="h-3.5 w-3.5 text-gold/70" />
          </button>
        )}
      </div>

      <div className="h-px shrink-0 bg-ink-line/60" />

      {/* ── Corpo: gate del Consulente OPPURE chat ── */}
      {gate ? (
        <ConsultantGate
          view={gate}
          onView={setGate}
          onUnlock={onUnlock}
          locale={locale}
        />
      ) : (
        <>
          {/* Messaggi */}
          <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} text={m.content} color={color} />
            ))}
            {busy && <TypingDots color={color} />}
          </div>

          {/* Chip suggerimenti */}
          {chips.length > 0 && !busy && (
            <div className="flex shrink-0 flex-wrap gap-2 px-5 pb-3">
              {chips.map((c, i) => {
                const isWa = c.toLowerCase().includes('whatsapp');
                const label = isWa ? t('whatsappChip') : c;
                return (
                  <button
                    key={i}
                    onClick={() => send(c)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-medium transition',
                      isWa
                        ? 'text-white shadow-sm hover:brightness-105'
                        : 'border border-gold/40 bg-canvas-paper text-ink hover:border-gold hover:bg-gold/10'
                    )}
                    style={
                      isWa
                        ? { background: 'linear-gradient(135deg, #25b34a 0%, #1a8f3c 100%)' }
                        : undefined
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex shrink-0 items-center gap-2 border-t border-ink-line/60 bg-canvas-paper/60 p-3"
          >
            {/* altoparlante: leggi le risposte a voce (mani libere / alla guida) */}
            {voice.ttsSupported && (
              <button
                type="button"
                onClick={toggleVoiceOut}
                aria-label={voiceOut ? 'Voce attiva' : 'Voce disattivata'}
                title={voiceOut ? 'Risposte a voce: attive' : 'Risposte a voce: spente'}
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition',
                  voiceOut
                    ? 'border-gold bg-gold/15 text-gold'
                    : 'border-ink-line text-ink-mute hover:text-ink'
                )}
              >
                {voiceOut ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            )}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'consultant'
                  ? exhausted
                    ? tc('exhaustedPlaceholder')
                    : tc('placeholder')
                  : t('placeholder')
              }
              disabled={inputDisabled}
              className="flex-1 rounded-full border border-ink-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold disabled:opacity-60"
            />
            {/* microfono: premi e parla invece di scrivere */}
            {voice.sttSupported && (
              <button
                type="button"
                onClick={handleMic}
                disabled={busy || (mode === 'consultant' && exhausted)}
                aria-label={voice.listening ? 'Sto ascoltando…' : 'Parla'}
                title={voice.listening ? 'Sto ascoltando… tocca per fermare' : 'Premi e parla'}
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition',
                  voice.listening
                    ? 'animate-pulse text-white shadow-md'
                    : 'border border-gold/40 text-gold hover:bg-gold/10',
                  busy || (mode === 'consultant' && exhausted) ? 'opacity-50' : ''
                )}
                style={
                  voice.listening
                    ? { background: 'linear-gradient(135deg,#e0533a,#c0392b)' }
                    : undefined
                }
              >
                <Mic className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={inputDisabled || !input.trim()}
              aria-label="Invia"
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition',
                inputDisabled || !input.trim() ? 'opacity-50' : 'hover:scale-105'
              )}
              style={{
                background: 'linear-gradient(135deg, #ecdcb0 0%, #c9a849 55%, #a07a26 100%)',
              }}
            >
              <Send className="h-4 w-4 text-ink" />
            </button>
          </form>
        </>
      )}
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────
// Gate del Super Consulente: codice o richiesta accesso
// ──────────────────────────────────────────────────────────────
function ConsultantGate({
  view,
  onView,
  onUnlock,
  locale,
}: {
  view: 'menu' | 'request';
  onView: (v: null | 'menu' | 'request') => void;
  onUnlock: (s: ConsultSession) => void;
  locale: string;
}) {
  const tc = useTranslations('bolla.consultant');

  // unlock con codice
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  // richiesta accesso
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [reqBusy, setReqBusy] = useState(false);
  const [reqDone, setReqDone] = useState(false);
  const [reqErr, setReqErr] = useState('');

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean.length < 4 || busy) return;
    setBusy(true);
    setErr('');
    try {
      const res = await fetch('/api/consulente/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean }),
      });
      const data = await res.json();
      if (data.ok) {
        onUnlock({
          code: clean,
          tier: data.tier,
          remaining: data.remaining,
          documents: data.documents,
          unlimited: Boolean(data.unlimited),
        });
      } else {
        setErr(data.error ?? tc('invalidCode'));
      }
    } catch {
      setErr(tc('invalidCode'));
    } finally {
      setBusy(false);
    }
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reqBusy) return;
    if (name.trim().length < 2 || !email.includes('@') || msg.trim().length < 5) {
      setReqErr(tc('requestInvalid'));
      return;
    }
    setReqBusy(true);
    setReqErr('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: msg.trim(),
          locale,
          source: 'consultant-request',
        }),
      });
      if (res.ok) {
        setReqDone(true);
      } else {
        const d = await res.json().catch(() => ({}));
        setReqErr(d.error ?? tc('requestInvalid'));
      }
    } catch {
      setReqErr(tc('requestInvalid'));
    } finally {
      setReqBusy(false);
    }
  };

  const requestOnWhatsApp = () => {
    openWhatsApp(
      'legal',
      'Ciao AALA! Vorrei richiedere un accesso al Super Consulente (audit AI) per la mia impresa.'
    );
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
      {view === 'menu' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              {tc('badge')}
            </p>
            <h3 className="font-display text-xl leading-snug text-ink">{tc('title')}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{tc('intro')}</p>
          </div>

          {/* cosa ottieni */}
          <ul className="space-y-1.5 text-sm text-ink">
            {[tc('benefit1'), tc('benefit2'), tc('benefit3')].map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {/* inserisci codice */}
          <form onSubmit={submitCode} className="space-y-2">
            <label className="block text-xs font-medium text-ink-soft">{tc('haveCode')}</label>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={tc('codePlaceholder')}
                className="flex-1 rounded-full border border-ink-line bg-white px-4 py-2.5 text-sm font-mono tracking-wider text-ink outline-none transition focus:border-gold"
              />
              <button
                type="submit"
                disabled={busy || code.trim().length < 4}
                className={cn(
                  'shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold text-ink transition',
                  busy || code.trim().length < 4 ? 'opacity-50' : 'hover:brightness-105'
                )}
                style={{ background: 'linear-gradient(135deg,#ecdcb0,#c9a849,#a07a26)' }}
              >
                {busy ? tc('unlocking') : tc('unlock')}
              </button>
            </div>
            {err && <p className="text-xs text-red-600">{err}</p>}
          </form>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-ink-mute">
            <span className="h-px flex-1 bg-ink-line/60" />
            {tc('or')}
            <span className="h-px flex-1 bg-ink-line/60" />
          </div>

          {/* richiedi accesso */}
          <button
            onClick={() => onView('request')}
            className="w-full rounded-full border border-gold/50 bg-canvas-paper px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-gold hover:bg-gold/10"
          >
            {tc('requestAccess')}
          </button>

          <button
            onClick={() => onView(null)}
            className="flex w-full items-center justify-center gap-1.5 text-xs text-ink-mute transition hover:text-ink"
          >
            <ArrowLeft className="h-3 w-3" /> {tc('backToChat')}
          </button>
        </motion.div>
      )}

      {view === 'request' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <button
            onClick={() => onView('menu')}
            className="flex items-center gap-1.5 text-xs text-ink-mute transition hover:text-ink"
          >
            <ArrowLeft className="h-3 w-3" /> {tc('back')}
          </button>

          {reqDone ? (
            <div className="space-y-4 py-6 text-center">
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: 'linear-gradient(135deg,#ecdcb0,#c9a849,#8a6717)' }}
              >
                <Sparkles className="h-6 w-6 text-ink" />
              </div>
              <h3 className="font-display text-lg text-ink">{tc('requestDoneTitle')}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{tc('requestDone')}</p>
              <button
                onClick={requestOnWhatsApp}
                className="mx-auto block rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
                style={{ background: 'linear-gradient(135deg,#25b34a,#1a8f3c)' }}
              >
                {tc('requestWhatsapp')}
              </button>
            </div>
          ) : (
            <>
              <div>
                <h3 className="font-display text-lg text-ink">{tc('requestTitle')}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{tc('requestIntro')}</p>
              </div>
              <form onSubmit={submitRequest} className="space-y-2.5">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={tc('fieldName')}
                  className="w-full rounded-xl border border-ink-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tc('fieldEmail')}
                  className="w-full rounded-xl border border-ink-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold"
                />
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder={tc('fieldBusiness')}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-ink-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold"
                />
                {reqErr && <p className="text-xs text-red-600">{reqErr}</p>}
                <button
                  type="submit"
                  disabled={reqBusy}
                  className={cn(
                    'w-full rounded-full px-4 py-2.5 text-sm font-semibold text-ink transition',
                    reqBusy ? 'opacity-50' : 'hover:brightness-105'
                  )}
                  style={{ background: 'linear-gradient(135deg,#ecdcb0,#c9a849,#a07a26)' }}
                >
                  {reqBusy ? tc('requestSending') : tc('requestSend')}
                </button>
              </form>
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-ink-mute">
                <span className="h-px flex-1 bg-ink-line/60" />
                {tc('or')}
                <span className="h-px flex-1 bg-ink-line/60" />
              </div>
              <button
                onClick={requestOnWhatsApp}
                className="w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
                style={{ background: 'linear-gradient(135deg,#25b34a,#1a8f3c)' }}
              >
                {tc('requestWhatsapp')}
              </button>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}

function MessageBubble({
  role,
  text,
  color,
}: {
  role: 'user' | 'assistant';
  text: string;
  color: string;
}) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[82%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser ? 'text-canvas' : 'text-ink'
        )}
        style={
          isUser
            ? { background: '#15192a', borderBottomRightRadius: 6 }
            : {
                background: '#fff',
                borderBottomLeftRadius: 6,
                boxShadow: `0 1px 3px rgba(15,25,42,0.06), inset 0 0 0 1px ${color}1f`,
              }
        }
      >
        {text}
      </div>
    </motion.div>
  );
}

function TypingDots({ color }: { color: string }) {
  return (
    <div className="flex justify-start">
      <div
        className="flex items-center gap-1 rounded-2xl bg-white px-4 py-3"
        style={{ borderBottomLeftRadius: 6, boxShadow: '0 1px 3px rgba(15,25,42,0.06)' }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full"
            style={{
              background: color,
              animation: `bollaTyping 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
