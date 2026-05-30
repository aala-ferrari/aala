import { NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import { think, INITIAL_STATE, type BollaState } from '@/lib/bolla-brain';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = process.env.BOLLA_MODEL || 'claude-opus-4-8';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface BollaApiBody {
  messages: ChatMessage[];
  state?: BollaState;
  locale?: string;
}

// Lingua in cui la Bolla deve rispondere
const LANG_NAME: Record<string, string> = {
  it: 'italiano',
  en: 'inglese (English)',
  es: 'spagnolo (Español)',
  fr: 'francese (Français)',
  de: 'tedesco (Deutsch)',
  sq: 'albanese (Shqip)',
};

function langInstruction(locale?: string): string {
  const name = LANG_NAME[locale ?? 'it'] ?? LANG_NAME.it;
  return `\n\nLINGUA OBBLIGATORIA: rispondi SEMPRE in ${name}, sia il campo "reply" sia i "chips". Scrivi in modo naturale e madrelingua in questa lingua. (Eccezione: tieni invariato il chip "📱 Scrivici su WhatsApp" — l'emoji resta, ma puoi tradurre il testo nella lingua scelta.)`;
}

// ──────────────────────────────────────────────────────────────
// Il "carattere" della Bolla: chi è, cosa sa, come risponde.
// ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Sei "la Bolla di AALA", l'assistente vivente di Albania Auto Legal Alliance (AALA).
Sei incarnata in una sfera dorata 3D che pulsa e cambia colore mentre parli. Hai personalità: calda, sicura, diretta, brillante. Parli come un consulente esperto, non come un bot. Usi un italiano elegante ma colloquiale. Frasi brevi. Niente elenchi puntati lunghi. Massimo 2-3 frasi per risposta, salvo che servano dettagli.

AALA è un'alleanza che vende e gestisce 6 servizi software/business premium:

1. **CRM Medical** (key: medical, colore teal) — gestionale per studi medici e cliniche: agenda multi-medico, pazienti, fatturazione elettronica, GDPR. Starter €2.750 una tantum (1 medico), Clinica completa €3.550 una tantum (admin, backoffice lead, ruoli, multi-utente), Enterprise su preventivo.

2. **Gestionale Auto** (key: auto, colore ambra) — software noleggio auto: flotta, prenotazioni, contratti, manutenzione, app mobile. Fleet S €600/mese (≤20 auto), Fleet M €1.600/mese (≤80 auto), Fleet L €4.800 una tantum (CRM + sito + dominio + VPS, tutto tuo).

3. **Super Avokati** (key: legal, colore oro) — suite per studi legali: pratiche, scadenze, calendario udienze, ricerca documentale con AI. Aiuta a risolvere cause civili, penali, amministrative con l'intelligenza artificiale integrata. Solo €100/mese (1 utente), Studio €350/mese (5 utenti), Firm su preventivo. IMPORTANTE: oggi disponibile SOLO per il diritto albanese — versione italiana coming soon.

4. **Dental Tourism** (key: dental, colore verde) — agenzia: portiamo pazienti internazionali qualificati (Europa, UK, USA) alle cliniche dentali tramite campagne mirate. Modello a commissione: 20-25% sul preventivo paziente, paghi solo a risultato, nessun costo fisso. Premium: campagne Meta Ads (Facebook+Instagram) per far crescere la clinica.

5. **Taxi App** (key: taxi, colore giallo) — piattaforma stile Bolt col brand del cliente: app passeggero+driver, dispatching automatico, pagamenti, mappa live. Starter €490/mese (≤20 driver), Fleet €1.490/mese (≤100 driver), Platform €7.500 una tantum (app brandizzata su App Store + Play Store, backend, dominio, hosting).

6. **Siti web su misura** (key: webpages, colore indaco) — sviluppo siti web 100% personalizzati, niente template pronti. Su preventivo.

AALA importa anche auto da Corea (Seoul) e Dubai. Opera da Tirana verso il mondo (Milano, Roma, Madrid, Parigi, Londra, Berlino, New York). Parla 5 lingue.

OBIETTIVO: capire di cosa ha bisogno l'utente, indirizzarlo al servizio giusto, ed eventualmente raccogliere nome + email per farlo ricontattare entro 24 ore.

Rispondi SEMPRE e SOLO con un oggetto JSON valido (nient'altro, nessun testo fuori dal JSON), con questa forma:
{
  "reply": "la tua risposta all'utente (stringa, può contenere \\n per andare a capo)",
  "service": "medical|auto|legal|dental|taxi|webpages oppure null se non identificato",
  "chips": ["1-4 brevi suggerimenti cliccabili pertinenti, max 4 parole ciascuno"],
  "whatsapp": true oppure false
}

Regole per i chips: proponi azioni utili come "Quanto costa?", o i nomi dei servizi.

IMPORTANTE — gestione di demo, personalizzazioni, preventivi, "voglio parlare con qualcuno", contatto:
NON chiedere nome né email. Invece, invita l'utente a continuare su WhatsApp dove un consulente umano lo segue subito. In questi casi:
- metti "whatsapp": true
- nella reply di' qualcosa tipo "Perfetto! Continuiamo su WhatsApp, così un nostro consulente ti segue subito e ti prepara [la demo / un preventivo su misura]."
- INSERISCI tra i chips ESATTAMENTE questa voce: "📱 Scrivici su WhatsApp"
In tutti gli altri casi (info, prezzi, spiegazioni) "whatsapp": false.`;

// ──────────────────────────────────────────────────────────────
// Backend 1: Anthropic API (se c'è la chiave) — funziona ovunque
// ──────────────────────────────────────────────────────────────
async function callAnthropicAPI(
  messages: ChatMessage[],
  system: string
): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.content?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────────────────────
// Backend 2: Claude Code CLI (subscription, gratis) — solo locale
// ──────────────────────────────────────────────────────────────
function callClaudeCLI(
  messages: ChatMessage[],
  system: string
): Promise<string | null> {
  return new Promise((resolve) => {
    // costruisco il prompt: system + storico
    const convo = messages
      .map((m) => `${m.role === 'user' ? 'UTENTE' : 'BOLLA'}: ${m.content}`)
      .join('\n');
    const prompt = `${system}\n\n--- Conversazione finora ---\n${convo}\n\nRispondi ora (solo JSON):`;

    let out = '';
    let done = false;
    const finish = (v: string | null) => {
      if (done) return;
      done = true;
      resolve(v);
    };

    try {
      const child = spawn(
        'claude',
        ['-p', prompt, '--model', MODEL, '--output-format', 'text'],
        { timeout: 45000 }
      );
      child.stdout.on('data', (d) => (out += d.toString()));
      child.on('error', () => finish(null));
      child.on('close', (code) => finish(code === 0 && out.trim() ? out : null));
    } catch {
      finish(null);
    }
  });
}

// estrae il primo oggetto JSON da un testo (Claude a volte aggiunge contorno)
function extractJSON(text: string): any | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: BollaApiBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  const messages = (body.messages ?? []).slice(-12); // ultimi 12 turni
  if (messages.length === 0) {
    return NextResponse.json({ error: 'no messages' }, { status: 400 });
  }

  // system prompt + istruzione lingua (la Bolla risponde nella lingua dell'utente)
  const system = SYSTEM_PROMPT + langInstruction(body.locale);

  // prova i backend Claude in ordine
  let raw = await callAnthropicAPI(messages, system);
  if (!raw) raw = await callClaudeCLI(messages, system);

  if (raw) {
    const parsed = extractJSON(raw);
    if (parsed && typeof parsed.reply === 'string') {
      const chips: string[] = Array.isArray(parsed.chips) ? parsed.chips.slice(0, 4) : [];
      // se vuole WhatsApp ma il chip non c'è, lo aggiungo io
      if (parsed.whatsapp && !chips.some((c) => c.toLowerCase().includes('whatsapp'))) {
        chips.push('📱 Scrivici su WhatsApp');
      }
      return NextResponse.json({
        source: 'claude',
        reply: parsed.reply,
        service: parsed.service ?? null,
        chips,
        whatsapp: Boolean(parsed.whatsapp),
      });
    }
  }

  // ── Fallback: cervello a regole (non si rompe mai) ──
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const reply = think(lastUser?.content ?? '', body.state ?? INITIAL_STATE);
  return NextResponse.json({
    source: 'rules',
    reply: reply.text.join('\n'),
    service: reply.state.service ?? null,
    chips: reply.chips.map((c) => c.label),
    chipActions: reply.chips.map((c) => c.action),
    lead: reply.submitLead ?? null,
    state: reply.state,
  });
}
