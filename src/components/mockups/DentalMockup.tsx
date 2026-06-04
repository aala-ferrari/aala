'use client';

import { TrendingUp, Users, Globe, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BrowserFrame } from './BrowserFrame';

const PIPELINE = {
  newCol: [
    { name: 'Sarah J.', country: '🇬🇧 UK', value: '€3.500' },
    { name: 'Hans M.', country: '🇩🇪 DE', value: '€4.200' },
    { name: 'Marie L.', country: '🇫🇷 FR', value: '€2.800' },
  ],
  contacted: [
    { name: 'John D.', country: '🇺🇸 US', value: '€5.100' },
    { name: 'Anna K.', country: '🇩🇪 DE', value: '€3.900' },
  ],
  qualified: [{ name: 'Robert B.', country: '🇬🇧 UK', value: '€6.200' }],
  won: [{ name: 'Emma W.', country: '🇬🇧 UK', value: '€4.700' }],
};

const COL_COLORS: Record<string, string> = {
  newCol: '#0e7c8a',
  contacted: '#a85a1a',
  qualified: '#8a6717',
  won: '#2a7a5c',
};

export function DentalMockup() {
  const t = useTranslations('mockup.dental');
  return (
    <BrowserFrame url="dental.aala.io/leads">
      <div className="h-[560px] p-6">
        {/* KPI strip */}
        <div className="mb-5 grid grid-cols-4 gap-3">
          {[
            { label: t('leadsMonth'), value: '127', icon: Users, color: '#0e7c8a' },
            { label: t('conversion'), value: '34%', icon: TrendingUp, color: '#2a7a5c' },
            { label: t('pipelineValue'), value: '€84k', icon: Globe, color: '#8a6717' },
            { label: t('callsToday'), value: '12', icon: Phone, color: '#a85a1a' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-ink-line/60 bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-widest text-ink-mute">{s.label}</p>
                  <Icon className="h-3 w-3" style={{ color: s.color }} />
                </div>
                <p className="mt-2 font-display text-2xl text-ink">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* Pipeline kanban */}
        <div className="grid grid-cols-4 gap-3">
          {(Object.keys(PIPELINE) as (keyof typeof PIPELINE)[]).map((col) => {
            const color = COL_COLORS[col as string];
            const leads = PIPELINE[col];
            return (
              <div key={col} className="rounded-xl bg-canvas-soft/60 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                    <p className="text-[11px] font-medium text-ink">{t(col)}</p>
                  </div>
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] text-ink-soft">
                    {leads.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {leads.map((l, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-ink-line/50 bg-white p-2.5 text-[10px]"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-ink">{l.name}</p>
                        <span className="text-ink-mute">{l.country}</span>
                      </div>
                      <p className="mt-1 font-display text-sm text-[#2a7a5c]">{l.value}</p>
                      <div className="mt-2 flex items-center gap-1 text-[9px] text-ink-mute">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#c9a849]" />
                        <span>{t('treatment')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* world coverage */}
        <div className="mt-5 rounded-xl border border-ink-line/60 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-ink-mute">{t('patientOrigin')}</p>
              <p className="mt-1 font-display text-lg text-ink">{t('last30days')}</p>
            </div>
            <Globe className="h-5 w-5 text-[#2a7a5c]" />
          </div>
          <div className="mt-3 flex gap-2">
            {[
              { c: '🇬🇧', n: 'UK', pct: 38 },
              { c: '🇩🇪', n: 'DE', pct: 24 },
              { c: '🇫🇷', n: 'FR', pct: 18 },
              { c: '🇺🇸', n: 'US', pct: 12 },
              { c: '🇪🇸', n: 'ES', pct: 8 },
            ].map((c) => (
              <div key={c.n} className="flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs">{c.c} {c.n}</span>
                  <span className="text-[10px] text-ink-soft">{c.pct}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-canvas-warm/60">
                  <div className="h-full rounded-full bg-[#2a7a5c]" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
