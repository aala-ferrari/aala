import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from '@/lib/supabase/server';

const Body = z.object({ role: z.enum(['user', 'admin']) });

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const ssr = createSupabaseServerClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

  const admin = createSupabaseServiceClient();
  const { data: me } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (me?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // un admin non può togliere il ruolo a se stesso
  if (params.id === user.id) {
    return NextResponse.json(
      { error: 'Non puoi modificare il tuo stesso ruolo' },
      { status: 400 }
    );
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const { error } = await admin
    .from('profiles')
    .update({ role: parsed.data.role })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, role: parsed.data.role });
}
