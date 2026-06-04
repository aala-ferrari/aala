import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, type Locale } from './i18n';

const intl = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // sceglie la lingua anche dall'header Accept-Language del browser (fallback)
  localeDetection: true,
});

// Paese → lingua del sito. Chi non è mappato cade su Accept-Language / default.
const COUNTRY_LOCALE: Record<string, Locale> = {
  // Italiano
  IT: 'it', SM: 'it', VA: 'it', CH: 'it',
  // Albanese (Albania + Kosovo + Macedonia del Nord)
  AL: 'sq', XK: 'sq', MK: 'sq',
  // Spagnolo
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
  // Francese
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr',
  // Tedesco
  DE: 'de', AT: 'de', LI: 'de',
  // Inglese
  GB: 'en', US: 'en', IE: 'en', CA: 'en', AU: 'en', NZ: 'en',
};

export default function middleware(req: NextRequest) {
  // Solo al PRIMO accesso (nessuna lingua già scelta/salvata): deduci la lingua
  // dal paese del cliente. Dopo, la scelta dell'utente (cookie) vince sempre.
  if (!req.cookies.has('NEXT_LOCALE')) {
    const country = (
      req.headers.get('x-vercel-ip-country') || // Vercel
      req.headers.get('cf-ipcountry') ||         // Cloudflare
      req.headers.get('x-country') ||            // proxy generico
      ''
    ).toUpperCase();
    const geo = COUNTRY_LOCALE[country];
    if (geo) {
      // inietta la lingua del paese: next-intl reindirizza alla locale giusta
      req.cookies.set('NEXT_LOCALE', geo);
    }
  }
  return intl(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
