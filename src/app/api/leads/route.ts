import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

const LeadSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  company: z.string().max(160).optional(),
  service: z.enum(['medical', 'webpages', 'auto', 'taxi', 'legal', 'dental', 'other']).optional(),
  message: z.string().min(5).max(4000),
  locale: z.string().max(5).optional(),
});

export async function POST(req: Request) {
  let parsed;
  try {
    const json = await req.json();
    parsed = LeadSchema.parse(json);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid payload' },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from('leads').insert({
    ...parsed,
    source: 'contact-form',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
