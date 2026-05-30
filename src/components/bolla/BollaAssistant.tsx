'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Sparkles } from 'lucide-react';
import { BOLLA_COLORS, type BollaMood } from '@/lib/bolla-brain';
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

const WHATSAPP_NUMBER = '355699555777';
const SERVICE_LABELS: Record<string, string> = {
  medical: 'il CRM Medical',
  auto: 'il Gestionale Auto',
  legal: 'Super Avokati',
  dental: 'il Dental Tourism',
  taxi: 'la Taxi App',
  webpages: 'un sito web su misura',
};

function openWhatsApp(service: string | null) {
  const what = service && SERVICE_LABELS[service] ? SERVICE_LABELS[service] : 'i vostri servizi';
  const msg = `Ciao AALA! Ho parlato con la Bolla sul sito e vorrei più informazioni / una demo su ${what}.`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function BollaAssistant({ onClose }: { onClose: () => void }) {
  const t = useTranslations('bolla');
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || busy) return;

      // chip WhatsApp → apri la chat con messaggio precompilato, non inviare alla Bolla
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
        const res = await fetch('/api/bolla', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: nextMsgs, locale }),
        });
        const data: ApiReply = await res.json();

        // colore bolla + servizio corrente
        if (data.service && BOLLA_COLORS[data.service]) {
          setColor(BOLLA_COLORS[data.service]);
        }
        if (data.service) setCurrentService(data.service);

        setMood('speaking');
        setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
        setChips(data.chips ?? []);

        // torna idle dopo un attimo
        setTimeout(() => setMood('idle'), 2600);
      } catch {
        setMessages((m) => [...m, { role: 'assistant', content: t('error') }]);
        setMood('idle');
      } finally {
        setBusy(false);
      }
    },
    [messages, busy, currentService, locale, t]
  );

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
              {t('title')}
              <Sparkles className="h-3.5 w-3.5 text-gold" />
            </p>
            <p className="text-xs text-ink-soft">
              {mood === 'thinking' ? t('statusThinking') : t('statusIdle')}
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
      </div>

      <div className="h-px shrink-0 bg-ink-line/60" />

      {/* ── Messaggi (unica zona che scrolla) ── */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} text={m.content} color={color} />
        ))}
        {busy && <TypingDots color={color} />}
      </div>

      {/* ── Chip suggerimenti ── */}
      {chips.length > 0 && !busy && (
        <div className="flex shrink-0 flex-wrap gap-2 px-5 pb-3">
          {chips.map((c, i) => {
            const isWa = c.toLowerCase().includes('whatsapp');
            // il chip WhatsApp mostra sempre la versione tradotta nella lingua corrente
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

      {/* ── Input ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex shrink-0 items-center gap-2 border-t border-ink-line/60 bg-canvas-paper/60 p-3"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('placeholder')}
          disabled={busy}
          className="flex-1 rounded-full border border-ink-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Invia"
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition',
            busy || !input.trim() ? 'opacity-50' : 'hover:scale-105'
          )}
          style={{
            background: 'linear-gradient(135deg, #ecdcb0 0%, #c9a849 55%, #a07a26 100%)',
          }}
        >
          <Send className="h-4 w-4 text-ink" />
        </button>
      </form>
    </motion.div>
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
