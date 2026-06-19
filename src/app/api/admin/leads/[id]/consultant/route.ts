import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from '@/lib/supabase/server';
import {
  generateConsultantCode,
  CONSULTANT_TIERS,
  dbTier,
  type ConsultantTier,
} from '@/lib/demo-codes';
import { sendConsultantCodeEmail } from '@/lib/email';

const EXPIRES_DAYS = 14;

const TierEnum = z.enum(['smart', 'medium', 'max', 'unlimited']);

const Body = z.object({ tier: TierEnum });
const UpgradeBody = z.object({ code: z.string().min(4).max(40), tier: TierEnum });

async function requireAdmin(req: Request) {
  const ssr = createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Auth required' }, { status: 401 }) };
  const admin = createSupabaseServiceClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { user, admin };
}

// Admin: genera un codice Super Consulente per un lead, col tier scelto.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { user, admin } = auth;

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Tier non valido' }, { status: 400 });
  }
  const tier = parsed.data.tier as ConsultantTier;
  const spec = CONSULTANT_TIERS[tier];

  const { data: lead, error: leadErr } = await admin
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .single();
  if (leadErr || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  // genera codice univoco (retry su collisione)
  const expiresAt = new Date(Date.now() + EXPIRES_DAYS * 86400000).toISOString();
  let code: string | null = null;
  for (let i = 0; i < 5; i++) {
    const candidate = generateConsultantCode();
    const { error } = await admin.from('demo_codes').insert({
      code: candidate,
      vertical:
        lead.service && ['medical', 'auto', 'legal', 'dental', 'taxi', 'nabuel'].includes(lead.service)
          ? lead.service
          : 'legal',
      kind: 'consultant',
      tier: dbTier(tier), // 'unlimited' viene salvato come 'max' + limite enorme
      questions_limit: spec.questions,
      questions_used: 0,
      lead_id: lead.id,
      email: lead.email,
      created_by: user!.id,
      expires_at: expiresAt,
    });
    if (!error) {
      code = candidate;
      break;
    }
    if (!error.message.toLowerCase().includes('duplicate')) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  if (!code) {
    return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
  }

  const emailResult = await sendConsultantCodeEmail({
    to: lead.email,
    name: lead.name,
    code,
    tier,
    questions: spec.questions,
    documents: spec.documents,
    expiresInDays: EXPIRES_DAYS,
  });

  await admin.from('leads').update({ status: 'qualified' }).eq('id', lead.id);

  return NextResponse.json({
    code,
    tier,
    questions: spec.questions,
    documents: spec.documents,
    email: lead.email,
    expiresInDays: EXPIRES_DAYS,
    emailSent: emailResult.sent,
    emailError: emailResult.error ?? emailResult.skipped ?? null,
  });
}

// Admin: AGGIORNA il piano di un codice già esistente (es. Medium → Max → Illimitato).
// Mantiene le domande già usate, alza il limite e rinfresca la scadenza.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { admin } = auth;

  const parsed = UpgradeBody.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 });
  }
  const newTier = parsed.data.tier as ConsultantTier;
  const spec = CONSULTANT_TIERS[newTier];
  const codeUp = parsed.data.code.trim().toUpperCase();

  // il codice deve esistere, essere consulente e appartenere a questo lead
  const { data: row, error } = await admin
    .from('demo_codes')
    .select('*')
    .eq('code', codeUp)
    .eq('kind', 'consultant')
    .eq('lead_id', params.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: 'Errore lookup' }, { status: 500 });
  if (!row) return NextResponse.json({ error: 'Codice non trovato' }, { status: 404 });

  const expiresAt = new Date(Date.now() + EXPIRES_DAYS * 86400000).toISOString();
  const { error: upErr } = await admin
    .from('demo_codes')
    .update({
      tier: dbTier(newTier),
      questions_limit: spec.questions,
      expires_at: expiresAt,
    })
    .eq('code', codeUp);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({
    code: codeUp,
    tier: newTier,
    questions: spec.questions,
    documents: spec.documents,
    questionsUsed: row.questions_used ?? 0,
    expiresInDays: EXPIRES_DAYS,
  });
}
