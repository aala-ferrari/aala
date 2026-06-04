import { NextRequest } from 'next/server';

// Voce cloud (Azure Speech) per le lingue senza una buona voce nativa nel
// browser — su tutte = l'ALBANESE, che Apple/Google non offrono affatto.
// Se manca la chiave Azure, il route risponde 204 → il client usa la voce
// nativa gratuita (nessuna rottura).

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

export async function POST(req: NextRequest) {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  // niente chiave configurata → il client userà la voce nativa
  if (!key || !region) return new Response(null, { status: 204 });

  let body: { text?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return new Response('bad json', { status: 400 });
  }

  const text = (body.text || '').slice(0, 4000).trim();
  const locale = (body.locale || 'sq').slice(0, 2);
  const voice = AZURE_VOICE[locale];
  const langTag = LOCALE_TAG[locale] || 'sq-AL';
  if (!text || !voice) return new Response(null, { status: 204 });

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
    if (!r.ok) {
      // errore Azure (chiave/quota) → fallback nativo lato client
      return new Response(null, { status: 204 });
    }
    const audio = await r.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
    });
  } catch {
    return new Response(null, { status: 204 });
  }
}
