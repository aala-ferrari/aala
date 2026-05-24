import { NextResponse } from 'next/server';
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from '@/lib/supabase/server';
import { generateDemoCode } from '@/lib/demo-codes';
import { sendDemoCodeEmail } from '@/lib/email';
import type { VerticalKey } from '@/lib/products';

const VALID_VERTICALS: VerticalKey[] = ['medical', 'auto', 'legal', 'dental'];
const EXPIRES_DAYS = 7;

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // ---- auth: solo admin ----
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

  // ---- carica lead ----
  const { data: lead, error: leadErr } = await admin
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .single();

  if (leadErr || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  const vertical = (
    VALID_VERTICALS.includes(lead.service as VerticalKey)
      ? lead.service
      : 'legal'
  ) as VerticalKey;

  // ---- genera codice univoco (retry su collisione) ----
  let code: string | null = null;
  for (let i = 0; i < 5; i++) {
    const candidate = generateDemoCode(vertical);
    const { error } = await admin.from('demo_codes').insert({
      code: candidate,
      vertical,
      lead_id: lead.id,
      email: lead.email,
      created_by: user.id,
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
    return NextResponse.json(
      { error: 'Failed to generate unique code' },
      { status: 500 }
    );
  }

  // ---- invia email (best-effort, non blocca il flusso) ----
  const emailResult = await sendDemoCodeEmail({
    to: lead.email,
    name: lead.name,
    code,
    vertical,
    expiresInDays: EXPIRES_DAYS,
  });

  // ---- aggiorna stato lead ----
  await admin.from('leads').update({ status: 'qualified' }).eq('id', lead.id);

  return NextResponse.json({
    code,
    vertical,
    email: lead.email,
    expiresInDays: EXPIRES_DAYS,
    emailSent: emailResult.sent,
    emailError: emailResult.error ?? emailResult.skipped ?? null,
  });
}
