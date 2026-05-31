'use client';

import { useState, useMemo, useEffect } from 'react';
import { Check, Copy, KeyRound, Clock, Mail, Loader2, MailCheck, MailX, Link as LinkIcon, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

type ConsultTier = 'smart' | 'medium' | 'max';
const CONSULT_TIERS: { tier: ConsultTier; label: string; q: number }[] = [
  { tier: 'smart', label: 'Smart', q: 3 },
  { tier: 'medium', label: 'Medium', q: 8 },
  { tier: 'max', label: 'Max', q: 20 },
];

interface ConsultResult {
  code: string;
  tier: ConsultTier;
  questions: number;
  documents: boolean;
  expiresInDays: number;
  emailSent: boolean;
  emailError?: string | null;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  message: string;
  status: string;
  created_at: string;
}

interface DemoCode {
  code: string;
  vertical: string;
  lead_id: string | null;
  email: string | null;
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  new: '#0e7c8a',
  contacted: '#a85a1a',
  qualified: '#2a7a5c',
  won: '#8a6717',
  lost: '#5a6072',
};

export function LeadsTable({
  leads,
  codes: initialCodes,
}: {
  leads: Lead[];
  codes: DemoCode[];
}) {
  const [codes, setCodes] = useState<DemoCode[]>(initialCodes);
  const [approving, setApproving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<
    Record<string, { sent: boolean; reason?: string | null } | undefined>
  >({});
  // Super Consulente: codici generati per lead (client-side, durata sessione)
  const [consultResults, setConsultResults] = useState<Record<string, ConsultResult>>({});
  const [consultBusy, setConsultBusy] = useState<string | null>(null);

  async function generateConsultant(leadId: string, tier: ConsultTier) {
    setConsultBusy(leadId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/consultant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Errore');
      setConsultResults((prev) => ({
        ...prev,
        [leadId]: {
          code: json.code,
          tier: json.tier,
          questions: json.questions,
          documents: json.documents,
          expiresInDays: json.expiresInDays,
          emailSent: json.emailSent,
          emailError: json.emailError,
        },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setConsultBusy(null);
    }
  }

  const codesByLead = useMemo(() => {
    const map: Record<string, DemoCode[]> = {};
    for (const c of codes) {
      if (c.lead_id) {
        (map[c.lead_id] ??= []).push(c);
      }
    }
    return map;
  }, [codes]);

  async function approve(leadId: string) {
    setApproving(leadId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/approve`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Errore');

      // aggiungi il nuovo codice in cima
      setCodes((prev) => [
        {
          code: json.code,
          vertical: json.vertical,
          lead_id: leadId,
          email: json.email,
          used_at: null,
          expires_at: new Date(Date.now() + json.expiresInDays * 86400000).toISOString(),
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      // memorizza esito email (solo client-side, finché dura la sessione)
      setEmailStatus((prev) => ({
        ...prev,
        [json.code]: { sent: json.emailSent, reason: json.emailError },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setApproving(null);
    }
  }

  async function copyCode(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  }

  if (leads.length === 0) {
    return (
      <div className="card-paper p-12 text-center text-ink-soft">
        Nessuna richiesta ancora.
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {leads.map((lead) => {
          const leadCodes = codesByLead[lead.id] ?? [];
          const activeCode = leadCodes.find(
            (c) => !c.used_at && new Date(c.expires_at) > new Date()
          );
          return (
            <div key={lead.id} className="card-paper overflow-hidden">
              <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-start">
                {/* lead info */}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg text-ink">{lead.name}</h3>
                    <StatusPill status={lead.status} />
                    {lead.service && (
                      <span className="rounded-full bg-canvas-warm px-2 py-0.5 text-[10px] uppercase tracking-widest text-ink-soft">
                        {lead.service}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-soft">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {lead.email}
                    </span>
                    {lead.company && <span>· {lead.company}</span>}
                    {lead.phone && <span>· {lead.phone}</span>}
                    <span className="inline-flex items-center gap-1 text-ink-mute">
                      <Clock className="h-3 w-3" />
                      {new Date(lead.created_at).toLocaleString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {lead.message && (
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
                      {lead.message}
                    </p>
                  )}
                </div>

                {/* actions */}
                <div className="flex flex-col items-stretch gap-2 md:items-end">
                  {activeCode ? (
                    <CodeCard
                      code={activeCode}
                      onCopy={copyCode}
                      copied={copied}
                      emailInfo={emailStatus[activeCode.code]}
                    />
                  ) : (
                    <button
                      onClick={() => approve(lead.id)}
                      disabled={approving === lead.id}
                      className={cn(
                        'btn-primary',
                        approving === lead.id && 'opacity-60'
                      )}
                    >
                      {approving === lead.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Genero...
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4" /> Approva e genera codice
                        </>
                      )}
                    </button>
                  )}

                  {/* ── Super Consulente: genera codice con tier ── */}
                  <ConsultantPanel
                    leadId={lead.id}
                    busy={consultBusy === lead.id}
                    result={consultResults[lead.id]}
                    onGenerate={generateConsultant}
                    onCopy={copyCode}
                    copied={copied}
                  />
                </div>
              </div>

              {/* codici passati */}
              {leadCodes.length > (activeCode ? 1 : 0) && (
                <div className="border-t border-ink-line/60 bg-canvas-warm/30 px-5 py-3">
                  <p className="mb-1.5 text-[10px] uppercase tracking-widest text-ink-mute">
                    Codici precedenti
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {leadCodes
                      .filter((c) => c.code !== activeCode?.code)
                      .map((c) => (
                        <span
                          key={c.code}
                          className="inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[11px] text-ink-soft line-through"
                          title={c.used_at ? `Usato ${c.used_at}` : 'Scaduto'}
                        >
                          {c.code}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function ConsultantPanel({
  leadId,
  busy,
  result,
  onGenerate,
  onCopy,
  copied,
}: {
  leadId: string;
  busy: boolean;
  result?: ConsultResult;
  onGenerate: (leadId: string, tier: ConsultTier) => void;
  onCopy: (text: string, key: string) => void;
  copied: string | null;
}) {
  const [open, setOpen] = useState(false);

  if (result) {
    return (
      <div className="mt-1 rounded-xl border border-gold/40 bg-gold/5 p-3 md:min-w-[300px]">
        <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gold">
          <Brain className="h-3 w-3" /> Super Consulente · {result.tier}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <code className="rounded-md bg-white px-3 py-1.5 font-mono text-base font-bold text-ink">
            {result.code}
          </code>
          <button
            onClick={() => onCopy(result.code, result.code)}
            className="rounded-md border border-ink-line bg-white p-1.5 text-ink-soft transition hover:text-ink"
            title="Copia codice"
          >
            {copied === result.code ? (
              <Check className="h-3.5 w-3.5 text-[#2a7a5c]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-ink-mute">
          {result.questions} domande{result.documents ? ' + documenti' : ''} · scade tra{' '}
          {result.expiresInDays} giorni
        </p>
        {result.emailSent ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-[#2a7a5c]">
            <MailCheck className="h-3 w-3" /> Email inviata al cliente
          </p>
        ) : (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-[#a85a1a]">
            <MailX className="h-3 w-3" /> Email non inviata — manda il codice a mano
          </p>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-gold/40 bg-canvas-paper px-3 py-1.5 text-xs font-medium text-ink transition hover:border-gold hover:bg-gold/10"
      >
        <Brain className="h-3.5 w-3.5 text-gold" /> Codice Super Consulente
      </button>
    );
  }

  return (
    <div className="mt-1 rounded-xl border border-gold/30 bg-gold/5 p-3 md:min-w-[260px]">
      <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gold">
        <Brain className="h-3 w-3" /> Scegli il piano
      </p>
      <div className="flex flex-col gap-1.5">
        {CONSULT_TIERS.map((tt) => (
          <button
            key={tt.tier}
            onClick={() => onGenerate(leadId, tt.tier)}
            disabled={busy}
            className={cn(
              'flex items-center justify-between rounded-lg border border-ink-line bg-white px-3 py-2 text-left text-xs transition hover:border-gold',
              busy && 'opacity-60'
            )}
          >
            <span className="font-semibold text-ink">{tt.label}</span>
            <span className="text-ink-mute">
              {tt.q} domande{tt.tier === 'max' ? ' + doc' : ''}
            </span>
          </button>
        ))}
      </div>
      {busy && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-ink-soft">
          <Loader2 className="h-3 w-3 animate-spin" /> Genero e invio email…
        </p>
      )}
      <button
        onClick={() => setOpen(false)}
        className="mt-2 text-[10px] text-ink-mute transition hover:text-ink"
      >
        Annulla
      </button>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? '#5a6072';
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest"
      style={{ background: `${color}1a`, color }}
    >
      {status}
    </span>
  );
}

function CodeCard({
  code,
  onCopy,
  copied,
  emailInfo,
}: {
  code: DemoCode;
  onCopy: (text: string, key: string) => void;
  copied: string | null;
  emailInfo?: { sent: boolean; reason?: string | null };
}) {
  const days = Math.max(
    0,
    Math.ceil((new Date(code.expires_at).getTime() - Date.now()) / 86400000)
  );

  // URL diretto: il cliente clicca → entra senza scrivere il codice a mano
  const [directUrl, setDirectUrl] = useState('');
  useEffect(() => {
    setDirectUrl(`${window.location.origin}/it/demo?code=${code.code}`);
  }, [code.code]);

  return (
    <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 md:min-w-[300px]">
      <p className="text-[10px] uppercase tracking-widest text-gold">Codice demo attivo</p>

      <div className="mt-2 flex items-center gap-2">
        <code className="rounded-md bg-white px-3 py-1.5 font-mono text-base font-bold text-ink">
          {code.code}
        </code>
        <button
          onClick={() => onCopy(code.code, code.code)}
          className="rounded-md border border-ink-line bg-white p-1.5 text-ink-soft transition hover:text-ink"
          title="Copia solo il codice"
        >
          {copied === code.code ? (
            <Check className="h-3.5 w-3.5 text-[#2a7a5c]" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <p className="mt-1.5 text-[10px] text-ink-mute">
        Scade tra {days} giorni · uso singolo
      </p>

      {directUrl && (
        <div className="mt-3 border-t border-gold/20 pt-2.5">
          <p className="text-[10px] uppercase tracking-widest text-ink-mute">
            Link diretto (1 click per il cliente)
          </p>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 truncate rounded-md bg-white px-2 py-1 font-mono text-[10px] text-ink-soft">
              {directUrl}
            </code>
            <button
              onClick={() => onCopy(directUrl, `url-${code.code}`)}
              className="rounded-md border border-ink-line bg-white p-1.5 text-ink-soft transition hover:text-ink"
              title="Copia link"
            >
              {copied === `url-${code.code}` ? (
                <Check className="h-3.5 w-3.5 text-[#2a7a5c]" />
              ) : (
                <LinkIcon className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-[10px] text-ink-mute">
            Manda questo link via WhatsApp/email → il cliente clicca → entra senza scrivere nulla
          </p>
        </div>
      )}

      {emailInfo && <EmailStatusBadge sent={emailInfo.sent} reason={emailInfo.reason} />}
    </div>
  );
}

function EmailStatusBadge({
  sent,
  reason,
}: {
  sent: boolean;
  reason?: string | null;
}) {
  if (sent) {
    return (
      <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-[#2a7a5c]">
        <MailCheck className="h-3 w-3" />
        Email inviata al cliente
      </p>
    );
  }

  const friendly =
    reason === 'no-api-key'
      ? 'Resend non configurato — invia il codice manualmente'
      : reason === 'no-from'
      ? 'Manca RESEND_FROM_EMAIL — invia manualmente'
      : reason === 'no-recipient'
      ? 'Lead senza email — invia manualmente'
      : `Email NON inviata${reason ? `: ${reason}` : ''} — invia manualmente`;

  return (
    <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-[#a85a1a]">
      <MailX className="h-3 w-3" />
      {friendly}
    </p>
  );
}
