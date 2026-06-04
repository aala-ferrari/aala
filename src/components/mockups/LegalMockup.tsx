'use client';

import { Scale, FileText, Clock, AlertCircle, Search, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BrowserFrame } from './BrowserFrame';

const CASES = [
  { ref: '2024/142', title: 'Rossi vs. Comune di Milano', type: 'administrative', deadline: '12 Giu', urgent: true },
  { ref: '2024/138', title: 'Bianchi — Successione', type: 'civil', deadline: '18 Giu', urgent: false },
  { ref: '2024/127', title: 'SrL Verdi — Contenzioso fiscale', type: 'tax', deadline: '24 Giu', urgent: false },
  { ref: '2024/119', title: 'Costa — Diritto del lavoro', type: 'labor', deadline: '30 Giu', urgent: false },
];

export function LegalMockup() {
  const t = useTranslations('mockup.legal');
  return (
    <BrowserFrame url="legal.aala.io/pratiche">
      <div className="grid h-[560px] grid-cols-[55%_45%]">
        {/* left: cases */}
        <div className="border-r border-ink-line/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-ink-mute">{t('cases')}</p>
              <h3 className="font-display text-lg text-ink">{t('inProgress')} · 47</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-ink-line/60 bg-white px-3 py-1.5 text-[10px] text-ink-soft">
                <Search className="h-3 w-3" />
                <span>{t('search')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {CASES.map((c) => (
              <div
                key={c.ref}
                className="rounded-xl border border-ink-line/50 bg-white p-3 transition hover:shadow-soft"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#8a6717]">
                      {t('caseRef')} {c.ref}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-ink">{c.title}</p>
                    <p className="mt-0.5 text-[10px] text-ink-soft">{t(c.type)}</p>
                  </div>
                  {c.urgent && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#a85a1a]/15 px-2 py-0.5 text-[9px] font-medium text-[#a85a1a]">
                      <AlertCircle className="h-2.5 w-2.5" /> {t('urgent')}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-3 text-[10px] text-ink-soft">
                  <span className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {t('deadline')} {c.deadline}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-2.5 w-2.5" />
                    {t('documents', { n: 24 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right: AI search panel */}
        <div className="bg-canvas-soft/60 p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8a6717] text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-ink-mute">{t('aiAssistant')}</p>
              <p className="text-sm font-medium text-ink">{t('docSearch')}</p>
            </div>
          </div>

          <div className="rounded-xl border border-ink-line/60 bg-white p-3">
            <p className="text-xs text-ink-soft">
              "Trova sentenze sulla responsabilità contrattuale negli ultimi 2 anni"
            </p>
          </div>

          <div className="mt-3 space-y-2">
            {[
              { title: 'Cass. civ. n. 14523/2024', match: '94%' },
              { title: 'Trib. Milano n. 8211/2023', match: '87%' },
              { title: 'Cass. civ. n. 9876/2023', match: '82%' },
            ].map((res) => (
              <div
                key={res.title}
                className="flex items-center justify-between rounded-lg border border-ink-line/50 bg-white p-3"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-ink-mute" />
                  <p className="text-[11px] font-medium text-ink">{res.title}</p>
                </div>
                <span className="rounded-full bg-[#2a7a5c]/10 px-2 py-0.5 text-[9px] font-medium text-[#2a7a5c]">
                  {res.match}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-[#8a6717]/30 bg-[#8a6717]/5 p-4">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#8a6717]" />
              <p className="text-xs font-medium text-ink">{t('hearingCalendar')}</p>
            </div>
            <div className="mt-3 space-y-2">
              {[
                { date: '12 Giu', court: 'Tribunale di Milano' },
                { date: '18 Giu', court: 'Corte d\'Appello' },
                { date: '24 Giu', court: 'Commiss. Tributaria' },
              ].map((u) => (
                <div key={u.date} className="flex items-center justify-between text-[10px]">
                  <span className="text-ink-soft">{u.court}</span>
                  <span className="font-medium text-ink">{u.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
