import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from '@/lib/supabase/server';

// La tessera dell'ordine caricata col modulo «Provoje tani» (superavokati.ai).
// Solo l'admin può vederla: serve per verificare che il richiedente sia
// davvero un professionista prima di dargli l'accesso di prova.
const TESSERA_DIR = process.env.TESSERA_DIR || '/opt/aala-tessere';
const NOME_VALIDO = /^[a-f0-9-]{36}\.(jpg|png|webp|heic|pdf)$/;
const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  pdf: 'application/pdf',
};

export async function GET(
  _req: Request,
  { params }: { params: { file: string } }
) {
  // ---- auth: solo admin (stesso schema di approve) ----
  const ssr = createSupabaseServerClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

  const admin = createSupabaseServiceClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ---- nome file blindato: solo uuid.ext, niente path ----
  const nome = params.file;
  if (!NOME_VALIDO.test(nome)) {
    return NextResponse.json({ error: 'Bad name' }, { status: 400 });
  }

  try {
    const buf = await readFile(path.join(TESSERA_DIR, nome));
    const ext = nome.split('.').pop() as string;
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': MIME[ext] ?? 'application/octet-stream',
        'Content-Disposition': `inline; filename="${nome}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
