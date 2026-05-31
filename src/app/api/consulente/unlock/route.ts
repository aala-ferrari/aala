import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { CONSULTANT_TIERS, effectiveTier, isUnlimited } from '@/lib/demo-codes';

const Body = z.object({
  code: z.string().min(4).max(40).transform((s) => s.trim().toUpperCase()),
});

const REASON_MSG: Record<string, string> = {
  not_found: 'Codice non valido.',
  not_consultant: 'Questo codice non è abilitato al Super Consulente.',
  expired: 'Codice scaduto. Richiedine uno nuovo.',
};

// Valida un codice Consulente SENZA consumare domande (solo lettura).
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Codice mancante' }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc('validate_consultant_code', {
    p_code: parsed.data.code,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: 'Errore di verifica' }, { status: 500 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || !row.ok) {
    const reason = row?.reason ?? 'not_found';
    return NextResponse.json(
      { ok: false, error: REASON_MSG[reason] ?? 'Codice non valido.' },
      { status: 200 }
    );
  }

  const tier = effectiveTier(row.tier, row.questions_limit);
  const spec = CONSULTANT_TIERS[tier];
  const unlimited = isUnlimited(row.questions_limit);

  return NextResponse.json({
    ok: true,
    code: parsed.data.code,
    tier,
    unlimited,
    questionsLimit: row.questions_limit,
    questionsUsed: row.questions_used,
    remaining: row.remaining,
    documents: spec?.documents ?? false,
  });
}
