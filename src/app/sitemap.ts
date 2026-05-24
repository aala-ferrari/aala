import type { MetadataRoute } from 'next';
import { locales } from '@/i18n';
import { VERTICAL_LIST } from '@/lib/products';

const ROUTES = ['', '/prezzi', '/chi-siamo', '/contatti', '/privacy', '/termini', '/cookie'];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aala.example';
  const out: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of ROUTES) {
      out.push({
        url: `${base}/${locale}${route}`,
        changeFrequency: 'monthly',
        priority: route === '' ? 1.0 : 0.7,
      });
    }
    for (const v of VERTICAL_LIST) {
      out.push({
        url: `${base}/${locale}/servizi/${v.slug}`,
        changeFrequency: 'monthly',
        priority: 0.9,
      });
    }
  }

  return out;
}
