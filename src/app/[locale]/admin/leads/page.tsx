import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { LeadsTable } from './LeadsTable';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage({ params }: { params: { locale: string } }) {
  const ssr = createSupabaseServerClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) redirect(`/${params.locale}/login`);

  // service-role per role check (evita ricorsione RLS) e per leggere tutti i lead
  const admin = createSupabaseServiceClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect(`/${params.locale}/account`);
  const [leadsRes, codesRes] = await Promise.all([
    admin.from('leads').select('*').order('created_at', { ascending: false }).limit(200),
    admin.from('demo_codes').select('*').order('created_at', { ascending: false }).limit(200),
  ]);

  return (
    <section className="pt-32 pb-24">
      <div className="container-aala">
        <Link
          href={`/${params.locale}/admin`}
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="h-3 w-3" /> Backoffice
        </Link>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-ink-mute">Admin · Lead</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight text-ink">
            Richieste e codici demo
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Quando approvi un lead, il sistema genera un codice univoco di accesso demo
            (valido 7 giorni). Copia il codice e invialo al cliente via email o WhatsApp.
          </p>
        </header>

        <LeadsTable
          leads={leadsRes.data ?? []}
          codes={codesRes.data ?? []}
        />
      </div>
    </section>
  );
}
