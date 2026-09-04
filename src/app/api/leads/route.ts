import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { sendLeadNotificationEmail } from '@/lib/email';

export const maxDuration = 60;

const LeadSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  company: z.string().max(160).optional(),
  service: z.enum(['medical', 'webpages', 'auto', 'taxi', 'legal', 'dental', 'nabuel', 'other']).optional(),
  message: z.string().min(5).max(4000),
  locale: z.string().max(5).optional(),
  // ⚠️ 'demo-video' mancava: il form del video su superavokati.ai mandava
  // quel source, riceveva 400 e il lead SPARIVA in silenzio (0 nel DB).
  source: z.enum(['contact-form', 'consultant-request', 'demo-video']).optional(),
});

// Tessera dell'ordine (avvocati/notai): documento professionale, non d'identità.
// Vive FUORI dal repo così sopravvive ai deploy; la legge solo l'admin
// (route /api/admin/leads/tessera/[file], auth admin).
const TESSERA_DIR = process.env.TESSERA_DIR || '/opt/aala-tessere';
const TESSERA_MAX_BYTES = 8 * 1024 * 1024;
const TESSERA_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heic',
  'application/pdf': 'pdf',
};

// Traduce l'errore di validazione in una frase chiara per l'utente
function friendlyError(field: unknown): string {
  switch (field) {
    case 'email':
      return "Inserisci un'email valida.";
    case 'name':
      return 'Inserisci il tuo nome.';
    case 'message':
      return 'Scrivi due righe in più nel messaggio (almeno 5 caratteri).';
    default:
      return 'Controlla i campi e riprova.';
  }
}

async function salvaTessera(file: File): Promise<string | null> {
  const ext = TESSERA_EXT[file.type];
  if (!ext) return null;
  if (file.size <= 0 || file.size > TESSERA_MAX_BYTES) return null;
  const nome = `${randomUUID()}.${ext}`;
  await mkdir(TESSERA_DIR, { recursive: true, mode: 0o700 });
  await writeFile(path.join(TESSERA_DIR, nome), Buffer.from(await file.arrayBuffer()), {
    mode: 0o600,
  });
  return nome;
}

// Il cervello di Super Avokati GUARDA il documento e dice se è davvero una
// tessera professionale (avvocato/notaio) o un documento qualsiasi — una
// carta d'identità non passa come tessera. Fire-and-forget: l'esito arriva
// nel pannello quando è pronto; a decidere resta sempre l'admin.
async function verificaTessera(leadId: string, nomeFile: string, file: File): Promise<void> {
  const segreto = process.env.DEMO_PROVISION_SECRET;
  if (!segreto) return;
  const fd = new FormData();
  fd.append('tessera', new Blob([await file.arrayBuffer()], { type: file.type }), nomeFile);
  const res = await fetch('http://127.0.0.1:5050/api/verify-tessera', {
    method: 'POST',
    headers: { 'X-Provision-Secret': segreto },
    body: fd,
    signal: AbortSignal.timeout(180_000),
  });
  const esito = await res.json().catch(() => null);
  if (!res.ok || !esito) throw new Error(esito?.error ?? `verify ${res.status}`);
  const admin = createSupabaseServiceClient();
  await admin
    .from('leads')
    .update({ tessera_check: JSON.stringify(esito) })
    .eq('id', leadId);
}

export async function POST(req: Request) {
  // Il modulo può arrivare in due vesti: JSON (com'è sempre stato) oppure
  // multipart/form-data quando il professionista allega la tessera dell'ordine.
  let raw: Record<string, unknown> = {};
  let tessera: File | null = null;

  if ((req.headers.get('content-type') ?? '').includes('multipart/form-data')) {
    const fd = await req.formData().catch(() => null);
    if (fd) {
      for (const k of ['name', 'email', 'phone', 'company', 'service', 'message', 'locale', 'source']) {
        const v = fd.get(k);
        if (typeof v === 'string' && v) raw[k] = v;
      }
      const f = fd.get('tessera');
      if (f instanceof File && f.size > 0) tessera = f;
    }
  } else {
    raw = await req.json().catch(() => ({}));
  }

  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return NextResponse.json({ error: friendlyError(field) }, { status: 400 });
  }

  let tesseraFile: string | null = null;
  if (tessera) {
    tesseraFile = await salvaTessera(tessera).catch(() => null);
    if (!tesseraFile) {
      return NextResponse.json(
        { error: 'Tessera non valida: JPG, PNG, WEBP, HEIC o PDF, max 8 MB.' },
        { status: 400 }
      );
    }
  }

  const supabase = createSupabaseServiceClient();
  const { source, ...lead } = parsed.data;
  const { data: inserito, error } = await supabase
    .from('leads')
    .insert({
      ...lead,
      source: source ?? 'contact-form',
      tessera_file: tesseraFile,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Verifica della tessera in background — non facciamo aspettare il cliente.
  if (tessera && tesseraFile && inserito?.id) {
    void verificaTessera(inserito.id, tesseraFile, tessera).catch(() => {
      /* senza esito il pannello mostra "in verifica" e decide l'admin */
    });
  }

  // Notifica in tempo reale all'admin (info@aala.global) — fire-and-forget:
  // non aspettiamo l'email per rispondere al cliente (niente attesa sulla latenza).
  void sendLeadNotificationEmail({
    ...lead,
    source: source ?? 'contact-form',
    tessera: Boolean(tesseraFile),
  }).catch(() => {
    /* la notifica non è critica per il cliente */
  });

  return NextResponse.json({ ok: true });
}
