import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { Users, ShoppingCart, Repeat, Inbox, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ params }: { params: { locale: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/login`);

  // service-role bypassa RLS (evita problemi di policy ricorsive)
  const admin = createSupabaseServiceClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect(`/${params.locale}/account`);

  const [usersRes, ordersRes, subsRes, leadsRes] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('orders').select('amount_eur, status', { count: 'exact' }),
    admin.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ]);

  // solo incassato davvero: ordini pagati/evasi (non pending/failed/refunded)
  const totalRevenue = (ordersRes.data ?? [])
    .filter((o) => o.status === 'paid' || o.status === 'fulfilled')
    .reduce((sum, o) => sum + (o.amount_eur ?? 0), 0);

  const stats = [
    { label: 'Utenti', value: usersRes.count ?? 0, icon: Users },
    { label: 'Abbonamenti attivi', value: subsRes.count ?? 0, icon: Repeat },
    { label: 'Ordini totali', value: ordersRes.count ?? 0, icon: ShoppingCart },
    { label: 'Lead nuovi', value: leadsRes.count ?? 0, icon: Inbox },
  ];

  return (
    <section className="pt-32 pb-24">
      <div className="container-aala">
        <header className="mb-12">
          <p className="text-xs uppercase tracking-widest text-ink-mute">Admin · AALA</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">Backoffice</h1>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card-paper p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-ink-mute">
                    {s.label}
                  </p>
                  <Icon className="h-4 w-4 text-gold" />
                </div>
                <p className="mt-4 font-display text-4xl">{s.value}</p>
              </div>
            );
          })}
        </div>

        <div className="card-paper mt-8 p-8">
          <p className="text-xs uppercase tracking-widest text-ink-mute">Fatturato totale</p>
          <p className="mt-3 font-display text-5xl gold-text">€ {totalRevenue.toLocaleString('it-IT')}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href={`/${params.locale}/admin/leads`}
            className="card-paper group flex items-center justify-between p-6 transition hover:shadow-lift"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-mute">Gestisci</p>
              <p className="mt-1 font-display text-xl text-ink">Lead e codici demo</p>
              <p className="mt-1 text-xs text-ink-soft">
                Approva richieste, genera codici, invio email automatico
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gold transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <Link
            href={`/${params.locale}/admin/users`}
            className="card-paper group flex items-center justify-between p-6 transition hover:shadow-lift"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-mute">Gestisci</p>
              <p className="mt-1 font-display text-xl text-ink">Account e ruoli</p>
              <p className="mt-1 text-xs text-ink-soft">
                Crea utenti, promuovi ad admin, gestisci accessi
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gold transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <Link
            href={`/${params.locale}/admin/orders`}
            className="card-paper group flex items-center justify-between p-6 transition hover:shadow-lift"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-mute">Gestisci</p>
              <p className="mt-1 font-display text-xl text-ink">Ordini & abbonamenti</p>
              <p className="mt-1 text-xs text-ink-soft">
                Conferma gli ordini assistiti, attiva i servizi ai clienti
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gold transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
