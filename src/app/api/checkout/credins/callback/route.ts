import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getNestPayConfig, verifyCallback, isApproved } from '@/lib/nestpay';

export const dynamic = 'force-dynamic';

/**
 * Ritorno dal gateway Credins (NestPay) dopo il 3D Secure. Il gateway fa un POST
 * (form-encoded) del browser verso okUrl/failUrl. Verifichiamo la firma, aggiorniamo
 * lo stato dell'ordine (paid/failed) e reindirizziamo l'utente alla pagina esito.
 */
async function handle(req: Request) {
  const cfg = getNestPayConfig();
  const base = (cfg?.baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://aala.global').replace(/\/$/, '');

  let params: Record<string, string> = {};
  try {
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      params = await req.json();
    } else {
      const form = await req.formData();
      params = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
    }
  } catch {
    return NextResponse.redirect(`${base}/it/checkout/bank?status=error`, 303);
  }

  // Senza config o firma non valida → esito errore (no frode).
  if (!cfg || !verifyCallback(params, cfg.storeKey)) {
    return NextResponse.redirect(`${base}/it/checkout/bank?status=error`, 303);
  }

  const ok = isApproved(params);
  const oid = params.oid || params.OID || '';
  const lang = cfg.lang || 'it';

  try {
    const admin = createSupabaseServiceClient();
    const { data: order } = await admin
      .from('orders')
      .select('id, metadata')
      .eq('metadata->>oid', oid)
      .maybeSingle();
    if (order) {
      await admin
        .from('orders')
        .update({
          status: ok ? 'paid' : 'failed',
          metadata: { ...(order.metadata || {}), gateway: { response: params.Response, procReturnCode: params.ProcReturnCode, mdStatus: params.mdStatus, authCode: params.AuthCode, transId: params.TransId } },
        })
        .eq('id', order.id);
    }
  } catch {
    // best-effort: anche se l'update fallisce, mostriamo l'esito reale al cliente.
  }

  return NextResponse.redirect(`${base}/${lang}/checkout/bank?status=${ok ? 'ok' : 'fail'}`, 303);
}

export async function POST(req: Request) { return handle(req); }
export async function GET(req: Request) { return handle(req); }
