import { NextRequest } from 'next/server';

// Voce cloud per le lingue senza una buona voce nativa nel browser — in pratica
// l'ALBANESE, che Apple/Google non offrono come voce di sistema.
//
// Due sorgenti, in ordine di preferenza:
//   1. Azure Speech (voce neurale vera sq-AL Anila/Ilir) — se configurata la chiave
//   2. Google Translate TTS (gratis, NESSUN account/carta) — fallback automatico
// Se nessuna funziona → 204 e il client usa la voce nativa del browser.

export const runtime = 'nodejs';

const AZURE_VOICE: Record<string, string> = {
  sq: 'sq-AL-AnilaNeural', // albanese (donna). Uomo: sq-AL-IlirNeural
  it: 'it-IT-ElsaNeural',
  en: 'en-US-JennyNeural',
  es: 'es-ES-ElviraNeural',
  fr: 'fr-FR-DeniseNeural',
  de: 'de-DE-KatjaNeural',
};
const LOCALE_TAG: Record<string, string> = {
  sq: 'sq-AL',
  it: 'it-IT',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
};

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ── 1. Azure (voce neurale a pagamento/free-tier, qualità migliore) ──
async function azureTts(text: string, locale: string): Promise<Uint8Array | null> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return null;
  const voice = AZURE_VOICE[locale];
  const langTag = LOCALE_TAG[locale] || 'sq-AL';
  if (!voice) return null;

  const ssml =
    `<speak version="1.0" xml:lang="${langTag}">` +
    `<voice name="${voice}">${escapeXml(text)}</voice></speak>`;
  try {
    const r = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'aala-bolla',
        },
        body: ssml,
      }
    );
    if (!r.ok) return null;
    return new Uint8Array(await r.arrayBuffer());
  } catch {
    return null;
  }
}

// ── 2. Google Translate TTS (gratis, niente chiave) ──
// L'endpoint accetta ~200 caratteri per richiesta: spezzo e concateno gli MP3.
function splitForGoogle(text: string, max = 180): string[] {
  const parts: string[] = [];
  let rest = text.trim();
  while (rest.length > max) {
    let cut = rest.lastIndexOf(' ', max);
    if (cut < max * 0.5) cut = max; // nessuno spazio comodo → taglio netto
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

async function googleTts(text: string, lang: string): Promise<Uint8Array | null> {
  const parts = splitForGoogle(text);
  const chunks: Uint8Array[] = [];
  try {
    for (let i = 0; i < parts.length; i++) {
      const q = encodeURIComponent(parts[i]);
      const url =
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}` +
        `&client=tw-ob&total=${parts.length}&idx=${i}&textlen=${parts[i].length}&q=${q}`;
      const r = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      });
      if (!r.ok) return null;
      chunks.push(new Uint8Array(await r.arrayBuffer()));
    }
  } catch {
    return null;
  }
  if (!chunks.length) return null;
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

export async function POST(req: NextRequest) {
  let body: { text?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return new Response('bad json', { status: 400 });
  }

  const text = (body.text || '').slice(0, 4000).trim();
  const locale = (body.locale || 'sq').slice(0, 2);
  if (!text) return new Response(null, { status: 204 });

  // 1° Azure se configurato, altrimenti 2° Google Translate (gratis)
  const audio =
    (await azureTts(text, locale)) || (await googleTts(text, locale));

  if (!audio) return new Response(null, { status: 204 }); // → nativo lato client
  return new Response(audio, {
    status: 200,
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
  });
}
