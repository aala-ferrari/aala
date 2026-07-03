import type { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/i18n';
import { VERTICAL_LIST } from '@/lib/products';
import { SITE } from '@/lib/seo';

const ROUTES = ['', '/prezzi', '/chi-siamo', '/contatti', '/privacy', '/termini', '/cookie'];

// hreflang: per ogni URL elenca le versioni in tutte le lingue (+ x-default) →
// SEO internazionale: Google mostra la lingua giusta a ogni paese.
function langs(path: string): Record<string, string> {
  const o: Record<string, string> = {};
  for (const l of locales) o[l] = `${SITE.url}/${l}${path}`;
  o['x-default'] = `${SITE.url}/${defaultLocale}${path}`;
  return o;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const route of ROUTES) {
      out.push({
        url: `${SITE.url}/${locale}${route}`,
        changeFrequency: 'weekly',
        priority: route === '' ? 1.0 : 0.7,
        alternates: { languages: langs(route) },
      });
    }
    for (const v of VERTICAL_LIST) {
      out.push({
        url: `${SITE.url}/${locale}/servizi/${v.slug}`,
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: { languages: langs(`/servizi/${v.slug}`) },
      });
    }
  }
  return out;
}
