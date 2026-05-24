import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from '@/lib/supabase/server';

const Body = z.object({
  email: z.string().email(),
  full_name: z.string().min(2).max(120).optional(),
  role: z.enum(['user', 'admin']).default('user'),
  // Modi di invitare:
  //   'invite' (default) → Supabase manda email con link per impostare password
  //   'password'         → admin imposta una password iniziale e la comunica
  mode: z.enum(['invite', 'password']).default('invite'),
  password: z.string().min(8).max(128).optional(),
});

export async function POST(req: Request) {
  // ---- auth: solo admin ----
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

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { email, full_name, role, mode, password } = parsed.data;

  // ---- crea utente ----
  let userId: string;
  if (mode === 'invite') {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/it/account`,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    userId = data.user.id;
  } else {
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    userId = data.user.id;
  }

  // ---- profile (il trigger handle_new_user lo crea con role='user'; aggiorniamo) ----
  await admin
    .from('profiles')
    .update({ role, full_name })
    .eq('id', userId);

  return NextResponse.json({
    id: userId,
    email,
    role,
    mode,
    invitedAt: new Date().toISOString(),
  });
}
