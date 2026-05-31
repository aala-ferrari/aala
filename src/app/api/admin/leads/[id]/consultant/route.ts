import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from '@/lib/supabase/server';
import {
  generateConsultantCode,
  CONSULTANT_TIERS,
  type ConsultantTier,
} from '@/lib/demo-codes';
import { sendConsultantCodeEmail } from '@/lib/email';

const EXPIRES_DAYS = 14;

const Body = z.object({
  tier: z.enum(['smart', 'medium', 'max']),
});

// Admin: genera un codice Super Consulente per un lead, col tier scelto.
export async function POST(req: Request, { params }: { params: { id: string } }) {
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
      vertical: lead.service && ['medical', 'auto', 'legal', 'dental', 'taxi'].includes(lead.service)
        ? lead.service
        : 'legal',
      kind: 'consultant',
      tier,
      questions_limit: spec.questions,
      questions_used: 0,
      lead_id: lead.id,
      email: lead.email,
      created_by: user.id,
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
