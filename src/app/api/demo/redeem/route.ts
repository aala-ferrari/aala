import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import type { VerticalKey } from '@/lib/products';

const Body = z.object({
  code: z
    .string()
    .min(4)
    .max(40)
    .transform((s) => s.trim().toUpperCase()),
});

// Mappa vertical → URL del prodotto vero (se hostato).
// Locale: i prodotti girano sul Mac dell'admin sui rispettivi porti.
// Produzione: sostituire con sottodomini hostati.
const LIVE_PRODUCT_URL: Partial<Record<VerticalKey, string>> = {
  medical: process.env.URL_PRODUCT_CRM_MEDICAL || 'http://localhost:4002',
  auto: process.env.URL_PRODUCT_AUTO || 'http://localhost:4011',
  legal: process.env.URL_PRODUCT_LEGAL || 'http://localhost:5050',
  dental: process.env.URL_PRODUCT_DENTAL || 'https://medicalalbania.com',
  taxi: process.env.URL_PRODUCT_TAXI || 'http://localhost:3001',
};

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Codice mancante' }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  const { data: row, error } = await supabase
    .from('demo_codes')
    .select('*')
    .eq('code', parsed.data.code)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Errore lookup' }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: 'Codice non valido' }, { status: 404 });
  }
  if (row.used_at) {
    return NextResponse.json(
      { error: 'Codice già utilizzato. Richiedine uno nuovo.' },
      { status: 410 }
    );
  }
  if (new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Codice scaduto' }, { status: 410 });
  }

  // Marca come usato
  await supabase
    .from('demo_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('code', row.code);

  const vertical = row.vertical as VerticalKey;
  const liveUrl = LIVE_PRODUCT_URL[vertical];

  // Se il prodotto è online → vai dritto al prodotto vero
  // Se no → landing /demo/[vertical] con mockup
  return NextResponse.json({
    ok: true,
    vertical,
    productUrl: liveUrl ?? null,
    redirectTo: liveUrl ?? `/demo/${vertical}?code=${encodeURIComponent(row.code)}`,
    external: Boolean(liveUrl),
  });
}
