import { SITE, VERTICAL_SEO, verticalMeta, type VerticalSeoKey } from '@/lib/seo';

// Script JSON-LD (Schema.org) — Google li usa per rich results e local SEO.

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Globale: Organization + WebSite (con SearchAction) + LocalBusiness per ogni sede.
export function GlobalJsonLd() {
  const org = {
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: `${SITE.url}${SITE.logo}`,
    email: SITE.email,
    telephone: SITE.phone,
    sameAs: SITE.sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE.phone,
      email: SITE.email,
      contactType: 'customer service',
      areaServed: ['AL', 'IT', 'XK', 'EU'],
      availableLanguage: ['sq', 'it', 'en', 'es', 'fr', 'de'],
    },
  };

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    publisher: { '@id': `${SITE.url}/#organization` },
    inLanguage: ['sq', 'it', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/it/servizi?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };

  const localBusinesses = SITE.places.map((p, i) => ({
    '@type': 'ProfessionalService',
    '@id': `${SITE.url}/#place-${i}`,
    name: `${SITE.name} — ${p.city}`,
    parentOrganization: { '@id': `${SITE.url}/#organization` },
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    image: `${SITE.url}${SITE.logo}`,
    priceRange: '€€',
    address: { '@type': 'PostalAddress', addressLocality: p.city, addressRegion: p.region, addressCountry: p.country },
    geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng },
    areaServed: p.country === 'AL' ? ['Tiranë', 'Durrës', 'Vlorë', 'Shqipëri', 'Kosovë'] : ['Milano', 'Italia'],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '19:00',
    },
  }));

  return <JsonLd data={{ '@context': 'https://schema.org', '@graph': [org, website, ...localBusinesses] }} />;
}

// Per pagina servizio: Service + (se prodotto software) SoftwareApplication.
export function ServiceJsonLd({ vertical, locale, slug }: { vertical: VerticalSeoKey; locale: string; slug: string }) {
  const m = verticalMeta(vertical, locale);
  const kw = VERTICAL_SEO[vertical]?.keywords ?? [];
  const url = `${SITE.url}/${locale}/servizi/${slug}`;
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: m.title,
        description: m.description,
        url,
        serviceType: kw.slice(0, 6),
        provider: { '@id': `${SITE.url}/#organization` },
        areaServed: ['Shqipëri', 'Kosovë', 'Italia', 'Europa'],
        availableChannel: { '@type': 'ServiceChannel', serviceUrl: url },
      }}
    />
  );
}

// FAQ (rich result "People also ask"): passa domande/risposte.
export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  if (!items.length) return null;
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((it) => ({
          '@type': 'Question',
          name: it.q,
          acceptedAnswer: { '@type': 'Answer', text: it.a },
        })),
      }}
    />
  );
}
