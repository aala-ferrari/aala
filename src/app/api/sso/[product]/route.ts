import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const PRODUCT_URLS: Record<string, string | undefined> = {
  auto: process.env.URL_PRODUCT_AUTO,
  medical: process.env.URL_PRODUCT_CRM_MEDICAL,
  legal: process.env.URL_PRODUCT_LEGAL,
  dental: process.env.URL_PRODUCT_DENTAL,
  taxi: process.env.URL_PRODUCT_TAXI,
  nabuel: process.env.URL_PRODUCT_NABUEL,
};

// In prod Next sta dietro a nginx → req.url restituisce localhost:3000
// (l'host interno). Per costruire URL pubblici corretti usiamo
// NEXT_PUBLIC_SITE_URL, sempre presente nel .env in produzione.
const PUBLIC_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? '';

/**
 * GET /api/sso/[product]
 *
 * Issues a signed JWT and redirects the user to the chosen vertical product.
 * The target product validates the token against AALA_SSO_SECRET (shared secret).
 *
 * The verticals (auto/crm-medical/super-avocati/dental-tourism) need a small
 * endpoint that:
 *   1. reads ?aala_token=...
 *   2. verifies HS256 with the same secret
 *   3. accepts the user (creating if needed) and sets a local session cookie
 */
export async function GET(
  req: Request,
  { params }: { params: { product: string } }
) {
  const target = PRODUCT_URLS[params.product];
  if (!target) {
    return NextResponse.json({ error: 'Unknown product' }, { status: 404 });
  }

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const base = PUBLIC_ORIGIN || new URL(req.url).origin;
    return NextResponse.redirect(new URL('/it/login', base));
  }

  const secret = process.env.AALA_SSO_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'SSO not configured' }, { status: 500 });
  }

  const token = await signJWT(
    {
      sub: user.id,
      email: user.email,
      aud: params.product,
      iss: 'aala',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 5, // 5 minutes
    },
    secret
  );

  const url = new URL(target);
  url.searchParams.set('aala_token', token);
  return NextResponse.redirect(url);
}

// ----- minimal HS256 JWT signer (no extra dep) -----
async function signJWT(payload: Record<string, unknown>, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const enc = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const data = `${enc(header)}.${enc(payload)}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sig = Buffer.from(sigBuf)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${data}.${sig}`;
}
