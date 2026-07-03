// ============================================================================
// SEO CENTRALE AALA — keyword (Albania + internazionale, multilingua), meta
// per verticale/locale, hreflang e dati per structured data (JSON-LD).
// Obiettivo: primi risultati Google per AALA e i suoi prodotti (Auto/Rent,
// Super Avokati/legale, Nabuel/voice AI, CRM Medical, Dental, Taxi).
// ============================================================================

import { locales, defaultLocale } from '@/i18n';

export const SITE = {
  name: 'AALA',
  legalName: 'Albania Auto Legal Alliance',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aala.global',
  email: 'info@aala.global',
  phone: '+355699555777',
  phoneHuman: '+355 69 955 5777',
  logo: '/logo.png',
  sameAs: [
    'https://superavokati.ai',
    'https://nabuel.com',
    'https://taxi.aala.global',
  ],
  // Local SEO: 2 sedi
  places: [
    { city: 'Tiranë', region: 'Tirana', country: 'AL', lat: 41.3275, lng: 19.8189 },
    { city: 'Milano', region: 'Lombardia', country: 'IT', lat: 45.4642, lng: 9.19 },
  ],
};

// Keyword globali (miste lingue: Google le legge tutte).
export const SITE_KEYWORDS = [
  'AALA', 'software aziendale Albania', 'soluzioni digitali impresa', 'software gestionale Tirana',
  'AI per aziende', 'software për biznese Shqipëri', 'zgjidhje dixhitale', 'business software Albania',
  'digital solutions Tirana', 'intelligenza artificiale aziende', 'software su misura Albania',
];

type Meta = { title: string; description: string };
type LocaleMeta = Partial<Record<(typeof locales)[number], Meta>> & { en: Meta; it: Meta; sq: Meta };

export type VerticalSeoKey = 'medical' | 'auto' | 'legal' | 'dental' | 'taxi';

// Per ogni verticale: keyword (nazionali AL + internazionali) + meta per lingua.
export const VERTICAL_SEO: Record<VerticalSeoKey, { keywords: string[]; meta: LocaleMeta }> = {
  auto: {
    keywords: [
      'noleggio auto Albania', 'noleggio auto Tirana', 'autonoleggio Albania', 'auto rent Albania',
      'rent a car Tirana', 'rent a car Albania', 'car rental Albania', 'car hire Albania',
      'makina me qera', 'makina me qira', 'makina me qera Tiranë', 'qera makine Tiranë',
      'software noleggio auto', 'gestionale autonoleggio', 'fleet management Albania', 'software rent a car',
    ],
    meta: {
      it: { title: 'Noleggio Auto Albania · Software Rent a Car & Gestionale Flotta', description: 'Gestionale per autonoleggio e rent a car in Albania: prenotazioni, flotta, contratti, scadenze RCA e tagliandi. Software su misura per la tua attività di noleggio auto a Tirana e in tutta l’Albania.' },
      en: { title: 'Car Rental Albania · Rent a Car Software & Fleet Management', description: 'Car rental & rent a car software in Albania: bookings, fleet, contracts, insurance & service deadlines. Built for rental businesses in Tirana and across Albania.' },
      sq: { title: 'Makina me Qera Shqipëri · Software për Rent a Car & Menaxhim Flote', description: 'Software për makina me qera dhe rent a car në Shqipëri: rezervime, flota, kontrata, skadenca sigurimi RCA dhe servisi. I ndërtuar për bizneset e qeradhënies në Tiranë e mbarë Shqipërinë.' },
    },
  },
  legal: {
    keywords: [
      'avvocato AI', 'assistenza legale Albania', 'assistenza pratiche legali', 'stipulazione contratti',
      'sistema avvocato AI', 'software legale', 'consulenza legale online', 'AI lawyer', 'legal AI Albania',
      'avokat online', 'asistencë ligjore', 'asistencë juridike', 'konsulencë ligjore', 'kontrata ligjore',
      'praktika ligjore', 'avokat Shqipëri', 'ndihmë juridike', 'software për avokatë', 'Super Avokati',
    ],
    meta: {
      it: { title: 'Super Avokati · Avvocato AI, Assistenza Legale e Contratti', description: 'Sistema avvocato AI per assistenza legale, pratiche legali e stipulazione contratti in Albania. Consulenza giuridica intelligente basata sul diritto albanese, strategia e precedenti.' },
      en: { title: 'Super Avokati · AI Lawyer, Legal Assistance & Contracts', description: 'AI lawyer for legal assistance, legal practice and contract drafting in Albania. Smart legal counsel grounded in Albanian law, strategy and case precedents.' },
      sq: { title: 'Super Avokati · Avokat me AI, Asistencë Ligjore & Kontrata', description: 'Sistem avokat me inteligjencë artificiale për asistencë ligjore, praktika ligjore dhe hartim kontratash në Shqipëri. Konsulencë juridike e zgjuar, bazuar në ligjin shqiptar.' },
    },
  },
  medical: {
    keywords: [
      'software gestionale studio medico', 'CRM clinica', 'gestionale studio dentistico', 'software clinica dentale',
      'software mjekësor Shqipëri', 'menaxhim klinike', 'menaxhim klinike dentare', 'medical CRM Albania',
      'software poliambulatorio', 'agenda appuntamenti clinica', 'software për klinika',
    ],
    meta: {
      it: { title: 'CRM Medical · Software Gestionale per Cliniche e Studi Medici', description: 'CRM e gestionale per cliniche, studi medici e dentistici in Albania: pazienti, agenda, appuntamenti, cartelle e pagamenti. Software medico su misura.' },
      en: { title: 'CRM Medical · Practice Management Software for Clinics', description: 'CRM & practice management for clinics, medical and dental practices in Albania: patients, scheduling, records and payments. Tailored medical software.' },
      sq: { title: 'CRM Medical · Software Menaxhimi për Klinika e Studio Mjekësore', description: 'CRM dhe menaxhim për klinika, studio mjekësore e dentare në Shqipëri: pacientë, axhendë, takime, kartela dhe pagesa. Software mjekësor i personalizuar.' },
    },
  },
  dental: {
    keywords: [
      'turismo dentale Albania', 'impianti dentali Albania', 'dental tourism Albania', 'faccette dentali Albania',
      'all on 8 Albania', 'cure dentali Albania economiche', 'turizëm dentar Shqipëri', 'implante dentare Shqipëri',
      'dentist Tiranë', 'proteza dentare Shqipëri', 'dental implants Albania', 'zirconio Albania',
    ],
    meta: {
      it: { title: 'Turismo Dentale Albania · Impianti, Faccette e Cure a Tirana', description: 'Turismo dentale in Albania: impianti svizzeri, faccette estetiche, corone in zirconio e All-on-8 a Tirana. Qualità certificata, viaggio e hotel inclusi, risparmio fino al 70%.' },
      en: { title: 'Dental Tourism Albania · Implants, Veneers & Care in Tirana', description: 'Dental tourism in Albania: Swiss implants, veneers, zirconia crowns and All-on-8 in Tirana. Certified quality, travel & hotel included, save up to 70%.' },
      sq: { title: 'Turizëm Dentar Shqipëri · Implante, Faceta & Kujdes në Tiranë', description: 'Turizëm dentar në Shqipëri: implante zvicerane, faceta estetike, kurora zirkoni dhe All-on-8 në Tiranë. Cilësi e certifikuar, udhëtim e hotel përfshirë.' },
    },
  },
  taxi: {
    keywords: [
      'app taxi Albania', 'taxi Tirana', 'software taxi', 'gestionale taxi', 'taxi app Albania',
      'app taksi Shqipëri', 'taxi Tiranë', 'flotta taxi software', 'dispatch taxi', 'software për taksi',
      'car booking app Albania', 'ride hailing Albania',
    ],
    meta: {
      it: { title: 'Taxi App Albania · Software Taxi, Flotta e Centralino', description: 'App e software taxi per l’Albania: prenotazioni, flotta live, centralino, mappe Tirana, tariffe e pagamenti. La piattaforma completa per compagnie taxi.' },
      en: { title: 'Taxi App Albania · Taxi Software, Fleet & Dispatch', description: 'Taxi app & software for Albania: bookings, live fleet, dispatch, Tirana maps, fares and payments. The complete platform for taxi companies.' },
      sq: { title: 'Taxi App Shqipëri · Software Taksi, Flota & Qendër Thirrjesh', description: 'App dhe software taksi për Shqipërinë: rezervime, flota live, qendër thirrjesh, harta Tiranë, tarifa dhe pagesa. Platforma e plotë për kompanitë e taksive.' },
    },
  },
};

export function verticalMeta(key: VerticalSeoKey, locale: string): Meta {
  const m = VERTICAL_SEO[key]?.meta;
  if (!m) return { title: 'AALA', description: SITE_KEYWORDS.slice(0, 3).join(', ') };
  return (m as any)[locale] || m.en;
}

// hreflang / canonical per un path (senza locale iniziale, es. '' o '/servizi/auto').
export function altLanguages(path: string): Record<string, string> {
  const clean = path.replace(/\/$/, '');
  const langs: Record<string, string> = {};
  for (const l of locales) langs[l] = `${SITE.url}/${l}${clean}`;
  langs['x-default'] = `${SITE.url}/${defaultLocale}${clean}`;
  return langs;
}

export function canonical(locale: string, path: string): string {
  return `${SITE.url}/${locale}${path.replace(/\/$/, '')}`;
}
