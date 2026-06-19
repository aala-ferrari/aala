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

// Durata della prova demo: 12 ore dal PRIMO avvio (attivazione), per TUTTI i
// servizi. Entro la finestra il cliente può rientrare quante volte vuole; alla
// scadenza il codice non è più valido. `expires_at` del DB resta la deadline
// entro cui il codice va attivato la prima volta (default +7 giorni).
const DEMO_WINDOW_HOURS = 12;
const DEMO_WINDOW_MS = DEMO_WINDOW_HOURS * 60 * 60 * 1000;

// Mappa vertical → URL del prodotto vero. Default ai subdomain di produzione;
// in dev sul Mac si sovrascrive via URL_PRODUCT_* nel .env.local locale per
// puntare ai server che girano sui porti 4002/4011/5050/3001.
const LIVE_PRODUCT_URL: Partial<Record<VerticalKey, string>> = {
  medical: process.env.URL_PRODUCT_CRM_MEDICAL || 'https://crm.aala.global',
  auto: process.env.URL_PRODUCT_AUTO || 'https://auto.aala.global',
  legal: process.env.URL_PRODUCT_LEGAL || 'https://superavokati.ai',
  dental: process.env.URL_PRODUCT_DENTAL || 'https://medicalalbania.com',
  taxi: process.env.URL_PRODUCT_TAXI || 'https://taxi.aala.global/sso',
  nabuel: process.env.URL_PRODUCT_NABUEL || 'https://nabuel.com',
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
  const now = new Date();

  // ── Regola "12 ore dall'avvio" (uguale per tutti i servizi) ──
  // L'avvio è il PRIMO riscatto: da lì il cronometro delle 12h. Entro la
  // finestra si può rientrare; alla scadenza il codice è bruciato.
  let activatedAt: Date;
  if (row.used_at) {
    // già avviato: vale fino a used_at + 12h
    activatedAt = new Date(row.used_at);
    const deadline = new Date(activatedAt.getTime() + DEMO_WINDOW_MS);
    if (now > deadline) {
      return NextResponse.json(
        { error: 'Demo terminato: le 12 ore di prova sono finite. Richiedine uno nuovo.' },
        { status: 410 }
      );
    }
    // ancora dentro le 12h → rientro consentito, non si ri-attiva il cronometro
  } else {
    // mai avviato: dev'essere riscattato entro la finestra di attivazione (expires_at)
    if (new Date(row.expires_at) < now) {
      return NextResponse.json(
        { error: 'Codice scaduto: non è stato attivato in tempo. Richiedine uno nuovo.' },
        { status: 410 }
      );
    }
    // primo avvio → parte il cronometro delle 12h
    activatedAt = now;
    await supabase
      .from('demo_codes')
      .update({ used_at: now.toISOString() })
      .eq('code', row.code);
  }

  const demoExpiresAt = new Date(activatedAt.getTime() + DEMO_WINDOW_MS).toISOString();

  const vertical = row.vertical as VerticalKey;
  const liveUrl = LIVE_PRODUCT_URL[vertical];
  const showcase = `/demo/${vertical}?code=${encodeURIComponent(row.code)}`;

  // Esperienza coerente per TUTTI i servizi: non aprire mai una pagina morta.
  // Se il prodotto vero è raggiungibile → vai lì. Se è spento/non hostato →
  // apri la showcase AALA del servizio (funziona sempre).
  const reachable = liveUrl ? await isReachable(liveUrl) : false;

  return NextResponse.json({
    ok: true,
    vertical,
    productUrl: liveUrl ?? null,
    redirectTo: reachable ? liveUrl! : showcase,
    external: reachable,
    demoExpiresAt, // scadenza effettiva delle 12h (used_at + 12h)
    windowHours: DEMO_WINDOW_HOURS,
  });
}

// Ping veloce: il prodotto risponde? (timeout breve, qualunque risposta = vivo)
async function isReachable(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1800);
    const res = await fetch(url, { method: 'GET', redirect: 'manual', signal: ctrl.signal });
    clearTimeout(timer);
    return res.status > 0;
  } catch {
    return false;
  }
}
