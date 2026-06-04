'use client';

import { useTranslations } from 'next-intl';
import type { Plan, Vertical } from './products';

// Traduzioni del catalogo prodotti (hero, caratteristiche, piani) con FALLBACK
// all'italiano di products.ts: se manca la traduzione, mostra l'originale —
// così il sito non si rompe mai e le lingue si possono completare a tappe.
export function useCatalog() {
  const t = useTranslations('catalog');

  return {
    hero(v: Vertical) {
      const k = v.key;
      return {
        eyebrow: t.has(`${k}.heroEyebrow`) ? t(`${k}.heroEyebrow`) : v.hero.eyebrow,
        title: t.has(`${k}.heroTitle`) ? t(`${k}.heroTitle`) : v.hero.title,
        subtitle: t.has(`${k}.heroSubtitle`) ? t(`${k}.heroSubtitle`) : v.hero.subtitle,
      };
    },
    features(v: Vertical): { title: string; desc: string }[] {
      const key = `${v.key}.features`;
      return t.has(key) ? (t.raw(key) as { title: string; desc: string }[]) : v.features;
    },
    planName(v: Vertical, plan: Plan): string {
      const key = `${v.key}.plans.${plan.id}.name`;
      return t.has(key) ? t(key) : plan.name;
    },
    planFeatures(v: Vertical, plan: Plan): string[] {
      const key = `${v.key}.plans.${plan.id}.features`;
      return t.has(key) ? (t.raw(key) as string[]) : plan.features;
    },
  };
}
