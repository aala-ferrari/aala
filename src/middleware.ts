import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, type Locale } from './i18n-config';

/**
 * Sceglie la lingua e ci porta dentro. Nient'altro.
 *
 * ⚠️ PERCHE' NON USIAMO PIU' `next-intl/middleware` QUI.
 * In produzione (`next start` dietro nginx) il middleware di next-intl
 * costruiva URL **assoluti** su un'origine che Next si inventa da se':
 * `http://localhost:3000`. Conseguenze misurate, entrambe fatali:
 *   1. chi apriva `https://aala.global/` veniva rimandato a
 *      `https://localhost:3000/it` — cioe' a casa propria, non al sito;
 *   2. sulle pagine con prefisso lingua la riscrittura sembrava a Next
 *      *esterna* (origine diversa da quella della richiesta), quindi lui la
 *      proxava verso se stesso: un anello che finiva in timeout a 30s e
 *      **HTTP 500 su ogni pagina del sito**.
 * Non dipendeva dal Host, ne' da `X-Forwarded-Host`, ne' da
 * `__NEXT_PRIVATE_ORIGIN`: provati tutti e tre, nessuno cambia niente.
 *
 * Qui si evita il problema alla radice: **Location relativo**. Non nominiamo
 * nessuna origine, quindi non possiamo sbagliarla — la risolve il browser
 * contro l'indirizzo su cui si trova. Le pagine con la lingua gia' nel
 * percorso passano e basta: il segmento `[locale]` fa il resto, e
 * `getRequestConfig` legge la lingua dai parametri della rotta, non da qui.
 */

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

const isLocale = (v: string): v is Locale =>
  (locales as readonly string[]).includes(v);

/** Prima corrispondenza fra le lingue chieste dal browser e quelle che parliamo. */
function fromAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined;
  for (const parte of header.split(',')) {
    const tag = parte.split(';')[0].trim().toLowerCase();
    if (!tag) continue;
    if (isLocale(tag)) return tag;
    const base = tag.split('-')[0];        // "it-IT" → "it"
    if (isLocale(base)) return base;
  }
  return undefined;
}

function scegliLingua(req: NextRequest): Locale {
  // 1. la scelta dell'utente vince sempre
  const cookie = req.cookies.get('NEXT_LOCALE')?.value;
  if (cookie && isLocale(cookie)) return cookie;

  // 2. il paese, se il proxy davanti ce lo dice
  const paese = (
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-country') ||
    ''
  ).toUpperCase();
  if (COUNTRY_LOCALE[paese]) return COUNTRY_LOCALE[paese];

  // 3. le lingue del browser
  return fromAcceptLanguage(req.headers.get('accept-language')) ?? defaultLocale;
}

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Ha gia' la lingua nel percorso: si passa, ma dicendo QUALE lingua e'.
  const primo = pathname.split('/')[1] ?? '';
  if (isLocale(primo)) {
    // ⚠️ Questo header e' il modo in cui next-intl comunica la lingua al
    // server (`getRequestConfig` → `requestLocale`). Lo impostava il suo
    // middleware, che qui non usiamo piu': senza, `requestLocale` resta
    // vuoto, si cade sulla lingua predefinita e **tutte e sei le lingue
    // servono la stessa pagina italiana** — con l'URL giusto, il titolo
    // giusto e il contenuto sbagliato, che e' il modo peggiore di rompersi
    // perche' sembra funzionare.
    const headers = new Headers(req.headers);
    headers.set('X-NEXT-INTL-LOCALE', primo);
    return NextResponse.next({ request: { headers } });
  }

  const lingua = scegliLingua(req);
  const destinazione = `/${lingua}${pathname === '/' ? '' : pathname}${search}`;

  // L'origine la ricaviamo DAGLI HEADER, non da `req.nextUrl`: e' li' che Next
  // mette `localhost:3000` e da li' nasceva tutto il guasto. `Host` e
  // `X-Forwarded-Proto` arrivano da nginx e dicono come il visitatore ci ha
  // davvero raggiunti. (Un `Location` relativo sarebbe legittimo per l'HTTP,
  // ma Next lo rifiuta con ERR_INVALID_URL: lo analizza come URL assoluto.)
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('host') ?? 'aala.global';
  const res = new NextResponse(null, {
    status: 307,
    headers: { Location: `${proto}://${host}${destinazione}` },
  });
  // Ricordiamo la scelta, cosi' i giri successivi saltano tutto questo.
  res.cookies.set('NEXT_LOCALE', lingua, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  return res;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
