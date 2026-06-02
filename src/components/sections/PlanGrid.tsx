'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import type { Plan, Vertical } from '@/lib/products';
import { cn } from '@/lib/utils';

export function PlanGrid({ vertical }: { vertical: Vertical }) {
  const t = useTranslations('pricing');
  const locale = useLocale();

  return (
    <section className="py-24">
      <div className="container-aala">
        <div className="text-center">
          <div className="gold-rule mx-auto mb-6 w-24" />
          <h2 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
            {t('title')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">{t('subtitle')}</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {vertical.plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} vertical={vertical} index={i} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  vertical,
  index,
  locale,
}: {
  plan: Plan;
  vertical: Vertical;
  index: number;
  locale: string;
}) {
  const t = useTranslations('pricing');

  const ctaLabel =
    plan.billing === 'contact'
      ? t('contact')
      : plan.billing === 'one-time'
      ? t('buy')
      : t('subscribe');

  const ctaHref =
    plan.billing === 'contact'
      ? `/${locale}/contatti?plan=${plan.id}`
      : `/${locale}/checkout/${plan.id}`;

  const formattedPrice =
    plan.billing === 'contact'
      ? null
      : new Intl.NumberFormat(locale === 'en' ? 'en-US' : locale, {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(plan.price);

  const period =
    plan.billing === 'monthly'
      ? t('perMonth')
      : plan.billing === 'yearly'
      ? t('perYear')
      : plan.billing === 'one-time'
      ? ` · ${t('oneTime')}`
      : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={cn(
        'card-paper relative flex flex-col p-8',
        (plan.popular || plan.premium) && 'ring-2'
      )}
      style={
        plan.premium
          ? ({ '--tw-ring-color': '#c9a849' } as React.CSSProperties)
          : plan.popular
            ? ({ '--tw-ring-color': vertical.accent } as React.CSSProperties)
            : undefined
      }
    >
      {plan.premium ? (
        <span
          className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink shadow-sm"
          style={{ background: 'linear-gradient(135deg,#ecdcb0,#c9a849,#a07a26)' }}
        >
          <Sparkles className="h-3 w-3" /> Premium
        </span>
      ) : plan.popular ? (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-canvas"
          style={{ background: vertical.accent }}
        >
          {t('popular')}
        </span>
      ) : null}

      <h3 className="font-display text-2xl text-ink">{plan.name}</h3>

      <div className="mt-6 flex items-baseline gap-1">
        {formattedPrice ? (
          <>
            <span className="font-display text-5xl tracking-tight text-ink">{formattedPrice}</span>
            <span className="text-sm text-ink-soft">{period}</span>
          </>
        ) : (
          <span className="font-display text-3xl tracking-tight text-ink-soft">
            Su preventivo
          </span>
        )}
      </div>

      <ul className="mt-8 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-ink-soft">
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: vertical.accent }} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={cn(
          'mt-10 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition',
          plan.popular || plan.premium ? 'btn-primary' : 'btn-ghost'
        )}
      >
        {ctaLabel}
      </Link>
    </motion.div>
  );
}
