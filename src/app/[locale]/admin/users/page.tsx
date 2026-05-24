import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from '@/lib/supabase/server';
import { UsersTable, type AdminUser } from './UsersTable';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
  params,
}: {
  params: { locale: string };
}) {
  const ssr = createSupabaseServerClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) redirect(`/${params.locale}/login`);

  // service-role per role check (evita ricorsione RLS)
  const admin = createSupabaseServiceClient();
  const { data: me } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (me?.role !== 'admin') redirect(`/${params.locale}/account`);

  // unisco profiles + auth.users per avere ultimo accesso ed email confermata
  const [profilesRes, authRes] = await Promise.all([
    admin.from('profiles').select('*').order('created_at', { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 200 }),
  ]);

  const authById = new Map(authRes.data?.users.map((u) => [u.id, u]) ?? []);
  const users: AdminUser[] = (profilesRes.data ?? []).map((p) => {
    const a = authById.get(p.id);
    return {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      role: p.role,
      created_at: p.created_at,
      last_sign_in_at: a?.last_sign_in_at ?? null,
      email_confirmed: !!a?.email_confirmed_at,
    };
  });

  return (
    <section className="pt-32 pb-24">
      <div className="container-aala">
        <Link
          href={`/${params.locale}/admin`}
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="h-3 w-3" /> Backoffice
        </Link>

        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-mute">Admin · Utenti</p>
            <h1 className="mt-2 font-display text-4xl tracking-tight text-ink">
              Account e ruoli
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-soft">
              Gli utenti possono registrarsi liberamente da <code>/signup</code>. Da qui
              puoi <strong>crearli direttamente</strong>, promuoverli ad admin, o eliminarli.
            </p>
          </div>
        </header>

        <UsersTable users={users} currentUserId={user.id} />
      </div>
    </section>
  );
}
