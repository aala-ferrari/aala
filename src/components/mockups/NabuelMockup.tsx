'use client';

import { PhoneCall, PhoneIncoming, PhoneOutgoing, CalendarCheck, Clock, Bot } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BrowserFrame } from './BrowserFrame';

const VIOLET = '#8b5cf6';

const CALLS = [
  { dir: 'in', who: 'Hotel Belvedere', topic: 'Prenotazione camera · 2 notti', outcome: 'booked', dur: '1:42' },
  { dir: 'out', who: 'Mario R. (lead luce/gas)', topic: 'Offerta energia · richiamo', outcome: 'qualified', dur: '3:18' },
  { dir: 'in', who: 'Smile Clinic', topic: 'Appuntamento igiene dentale', outcome: 'booked', dur: '0:58' },
  { dir: 'out', who: 'Anna K. (no-show)', topic: 'Conferma trapianto capelli', outcome: 'rescheduled', dur: '2:05' },
];

const AGENTS = [
  { name: 'Reception · Hotel', sector: '🏨', status: 'inCall' },
  { name: 'Booking · Dentale', sector: '🦷', status: 'available' },
  { name: 'Vendite · Luce/Gas', sector: '⚡', status: 'inCall' },
  { name: 'Reception · Tricologia', sector: '💇', status: 'available' },
];

export function NabuelMockup() {
  const t = useTranslations('mockup.nabuel');
  return (
    <BrowserFrame url="nabuel.com/dashboard">
      <div className="grid h-[560px] grid-cols-[56%_44%]">
        {/* left: KPI + live calls */}
        <div className="border-r border-ink-line/60 p-5">
          {/* KPI strip */}
          <div className="mb-4 grid grid-cols-4 gap-2">
            {[
              { label: t('callsToday'), value: '312', icon: PhoneCall },
              { label: t('booked'), value: '87', icon: CalendarCheck },
              { label: t('agentsActive'), value: '4', icon: Bot },
              { label: t('avgDuration'), value: '1:54', icon: Clock },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-lg border border-ink-line/60 bg-white p-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-widest text-ink-mute">{s.label}</p>
                    <Icon className="h-3 w-3" style={{ color: VIOLET }} />
                  </div>
                  <p className="mt-1.5 font-display text-xl text-ink">{s.value}</p>
                </div>
              );
            })}
          </div>

          {/* live voice waveform card */}
          <div
            className="relative mb-4 overflow-hidden rounded-xl border border-ink-line/60 p-4"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 30% 30%, rgba(139,92,246,0.18), transparent 60%), radial-gradient(ellipse 50% 50% at 85% 80%, rgba(244,114,182,0.16), transparent 60%), linear-gradient(180deg, #f6f1fb 0%, #efe7f8 100%)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: VIOLET }} />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: VIOLET }} />
                </span>
                <p className="text-xs font-medium text-ink">{t('liveCall')}</p>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: `${VIOLET}1a`, color: VIOLET }}>
                {t('aiSpeaking')}
              </span>
            </div>
            {/* waveform */}
            <div className="mt-3 flex h-12 items-end gap-1">
              {[5, 9, 14, 22, 16, 28, 20, 34, 24, 30, 18, 26, 12, 20, 8, 15, 24, 32, 18, 10, 22, 14, 28, 16].map((h, i) => (
                <div key={i} className="flex-1 rounded-full" style={{ height: `${h + 6}px`, background: i % 2 ? '#f472b6' : VIOLET, opacity: 0.55 + (h / 60) }} />
              ))}
            </div>
            <p className="mt-2 text-[10px] text-ink-soft">“{t('transcript')}”</p>
          </div>

          {/* live calls list */}
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display text-base text-ink">{t('recentCalls')}</h3>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: `${VIOLET}14`, color: VIOLET }}>
              312 {t('today')}
            </span>
          </div>
          <div className="space-y-2">
            {CALLS.map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-ink-line/50 bg-white p-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: `${VIOLET}14` }}>
                    {c.dir === 'in'
                      ? <PhoneIncoming className="h-3 w-3" style={{ color: VIOLET }} />
                      : <PhoneOutgoing className="h-3 w-3" style={{ color: '#f472b6' }} />}
                  </div>
                  <div>
                    <p className="font-medium text-ink">{c.who}</p>
                    <p className="mt-0.5 text-[10px] text-ink-soft">{c.topic}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-medium" style={{ background: `${VIOLET}1a`, color: VIOLET }}>
                    {t(c.outcome)}
                  </span>
                  <p className="mt-1 text-[10px] text-ink-mute">{c.dur}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right: agents + funnel */}
        <div className="p-5">
          <h3 className="mb-3 font-display text-base text-ink">{t('agents')}</h3>
          <div className="space-y-2">
            {AGENTS.map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-ink-line/50 bg-white p-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas-warm/60 text-sm">{a.sector}</div>
                  <p className="font-medium text-ink">{a.name}</p>
                </div>
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium"
                  style={a.status === 'inCall' ? { background: `${VIOLET}1a`, color: VIOLET } : { background: '#2a7a5c1a', color: '#2a7a5c' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: a.status === 'inCall' ? VIOLET : '#2a7a5c' }} />
                  {t(a.status)}
                </span>
              </div>
            ))}
          </div>

          {/* funnel */}
          <div className="mt-5 rounded-xl border border-ink-line/60 bg-white p-4">
            <p className="text-[10px] uppercase tracking-widest text-ink-mute">{t('funnelTitle')}</p>
            <div className="mt-3 space-y-2.5">
              {[
                { label: t('answered'), pct: 100, n: '312' },
                { label: t('qualifiedLabel'), pct: 64, n: '198' },
                { label: t('bookedLabel'), pct: 28, n: '87' },
              ].map((f) => (
                <div key={f.label}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-ink-soft">{f.label}</span>
                    <span className="font-display text-sm text-ink">{f.n}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-canvas-warm/60">
                    <div className="h-full rounded-full" style={{ width: `${f.pct}%`, background: `linear-gradient(90deg, ${VIOLET}, #f472b6)` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border p-3" style={{ borderColor: `${VIOLET}40`, background: `${VIOLET}08` }}>
            <Bot className="h-4 w-4" style={{ color: VIOLET }} />
            <p className="text-[11px] text-ink">{t('insight')}</p>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
