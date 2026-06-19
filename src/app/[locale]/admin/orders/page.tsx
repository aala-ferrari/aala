import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { VERTICAL_LIST } from '@/lib/products';
import { OrderRow } from './OrderRow';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

function planName(productId: string): string {
  const p = VERTICAL_LIST.flatMap((v) => v.plans).find((x) => x.id === productId);
  return p?.name ?? productId;
}

export default async function AdminOrdersPage({ params }: { params: { locale: string } }) {
  const ssr = createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) redirect(`/${params.locale}/login`);

  const admin = createSupabaseServiceClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') redirect(`/${params.locale}/account`);

  const { data: orders } = await admin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  const list = orders ?? [];

  // profili dei clienti (query separata: non dipende dalle relazioni PostgREST)
  const userIds = Array.from(new Set(list.map((o) => o.user_id).filter(Boolean)));
  const { data: profs } = userIds.length
    ? await admin.from('profiles').select('id, email, full_name').in('id', userIds)
    : { data: [] as { id: string; email: string; full_name: string | null }[] };
  const profById = new Map((profs ?? []).map((p) => [p.id, p]));
  const pending = list.filter((o) => o.status === 'pending');
  const others = list.filter((o) => o.status !== 'pending');

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
          <p className="text-xs uppercase tracking-widest text-ink-mute">Admin · Ordini</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight text-ink">Ordini & abbonamenti</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Gli ordini <strong>assistiti</strong> arrivano in attesa: confermali dopo il pagamento
            (bonifico/accordo) per attivare il servizio al cliente. Gli ordini con carta si
            confermano da soli.
          </p>
        </header>

        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-ink-mute">
          Da confermare ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="mb-12 text-ink-soft">Nessun ordine in attesa.</p>
        ) : (
          <div className="mb-12 space-y-3">
            {pending.map((o) => (
              <OrderRow
                key={o.id}
                id={o.id}
                planName={planName(o.product_id)}
                email={profById.get(o.user_id)?.email ?? '—'}
                fullName={profById.get(o.user_id)?.full_name ?? ''}
                amount={o.amount_eur}
                months={Number((o.metadata as Record<string, unknown> | null)?.months ?? 1)}
                createdAt={o.created_at}
                status={o.status}
              />
            ))}
          </div>
        )}

        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-ink-mute">
          Storico ({others.length})
        </h2>
        {others.length === 0 ? (
          <p className="text-ink-soft">Nessun ordine.</p>
        ) : (
          <div className="space-y-3">
            {others.map((o) => (
              <OrderRow
                key={o.id}
                id={o.id}
                planName={planName(o.product_id)}
                email={profById.get(o.user_id)?.email ?? '—'}
                fullName={profById.get(o.user_id)?.full_name ?? ''}
                amount={o.amount_eur}
                months={Number((o.metadata as Record<string, unknown> | null)?.months ?? 1)}
                createdAt={o.created_at}
                status={o.status}
                readOnly
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
