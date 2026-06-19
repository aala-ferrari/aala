import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { Stethoscope, Car, Scale, Smile, Smartphone, PhoneCall, ArrowUpRight } from 'lucide-react';
import { VERTICAL_LIST, type VerticalKey } from '@/lib/products';

const ICONS = { medical: Stethoscope, auto: Car, legal: Scale, dental: Smile, taxi: Smartphone, nabuel: PhoneCall };

// mai cachata: ruolo/profilo sempre freschi a ogni richiesta
export const dynamic = 'force-dynamic';

export default async function AccountPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('account');
  const tcat = await getTranslations('catalog');
  const productLabel = (v: (typeof VERTICAL_LIST)[number]) =>
    tcat.has(`${v.key}.heroEyebrow`) ? tcat(`${v.key}.heroEyebrow`) : v.hero.eyebrow;
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/login`);

  // service-role per evitare problemi RLS sulla lettura del proprio profilo
  const admin = createSupabaseServiceClient();
  const [profileRes, subsRes, ordersRes] = await Promise.all([
    admin.from('profiles').select('*').eq('id', user.id).single(),
    admin.from('subscriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    admin.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ]);

  const profile = profileRes.data;
  const subs = subsRes.data ?? [];
  const orders = ordersRes.data ?? [];

  const now = Date.now();
  const ownedVerticals = new Set<VerticalKey>([
    ...subs
      .filter((s) => s.status === 'active' || s.status === 'trialing')
      .map((s) => s.vertical as VerticalKey),
    ...orders
      .filter((o) => {
        if (o.status !== 'paid' && o.status !== 'fulfilled') return false;
        // gli abbonamenti a blocco hanno period_end: attivi solo se non scaduti.
        // gli acquisti una-tantum non hanno period_end → restano attivi.
        const pe = (o.metadata as Record<string, unknown> | null)?.period_end as
          | string
          | undefined;
        return !pe || new Date(pe).getTime() > now;
      })
      .map((o) => {
        const v = VERTICAL_LIST.find((v) => v.plans.some((p) => p.id === o.product_id));
        return v?.key as VerticalKey;
      })
      .filter(Boolean),
  ]);

  return (
    <section className="pt-32 pb-24">
      <div className="container-aala">
        <header className="mb-12">
          <p className="text-xs uppercase tracking-widest text-ink-mute">{t('eyebrow')}</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
            {t('greetingPre')}{' '}
            <span className="gold-text">{profile?.full_name?.split(' ')[0] ?? t('welcome')}</span>
          </h1>

          {/* Scorciatoia al backoffice — visibile solo agli admin */}
          {profile?.role === 'admin' && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${params.locale}/admin/leads`}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ink transition hover:brightness-105"
                style={{ background: 'linear-gradient(135deg,#ecdcb0,#c9a849,#a07a26)' }}
              >
                🧠 {t('adminPanel')} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/${params.locale}/admin`}
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-canvas-paper px-5 py-2.5 text-sm font-medium text-ink transition hover:border-gold hover:bg-gold/10"
              >
                {t('backoffice')}
              </Link>
            </div>
          )}
        </header>

        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-ink-mute">
          {t('products')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VERTICAL_LIST.map((v) => {
            const Icon = ICONS[v.key];
            const owned = ownedVerticals.has(v.key);
            return (
              <div
                key={v.key}
                className="card-paper relative flex flex-col p-6"
                style={
                  owned
                    ? { borderColor: `rgba(${v.accentRgb}, 0.35)` }
                    : undefined
                }
              >
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-canvas-warm/60"
                  style={{ color: v.accent }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg">{productLabel(v)}</h3>
                <p className="mt-1 text-xs text-ink-mute">
                  {owned ? t('active') : t('inactive')}
                </p>
                {owned ? (
                  <Link
                    href={`/api/sso/${v.key}`}
                    className="mt-5 inline-flex items-center gap-1 text-sm text-gold hover:underline"
                  >
                    {t('open')} <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <Link
                    href={`/${params.locale}/servizi/${v.slug}`}
                    className="mt-5 text-sm text-ink-soft hover:text-ink"
                  >
                    {t('discover')} →
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <h2 className="mb-4 mt-16 text-sm font-medium uppercase tracking-widest text-ink-mute">
          {t('subscriptions')}
        </h2>
        {subs.length === 0 ? (
          <p className="text-ink-soft">{t('noSubscriptions')}</p>
        ) : (
          <ul className="space-y-3">
            {subs.map((s) => (
              <li key={s.id} className="card-paper flex items-center justify-between p-5">
                <div>
                  <p className="font-medium">{s.product_id}</p>
                  <p className="text-xs text-ink-mute">
                    {s.status} · {t('expires')} {s.current_period_end?.slice(0, 10)}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-widest text-ink-soft">
                  {s.vertical}
                </span>
              </li>
            ))}
          </ul>
        )}

        <h2 className="mb-4 mt-16 text-sm font-medium uppercase tracking-widest text-ink-mute">
          {t('orders')}
        </h2>
        {orders.length === 0 ? (
          <p className="text-ink-soft">{t('noOrders')}</p>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="card-paper flex items-center justify-between p-5">
                <div>
                  <p className="font-medium">{o.product_id}</p>
                  <p className="text-xs text-ink-mute">
                    {o.status} · {o.created_at?.slice(0, 10)}
                  </p>
                </div>
                <span className="font-display">€ {o.amount_eur}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
