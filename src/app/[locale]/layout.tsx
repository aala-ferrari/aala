import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Fraunces } from 'next/font/google';
import { locales, type Locale } from '@/i18n';
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from '@/lib/supabase/server';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { FloatingActions } from '@/components/layout/FloatingActions';
import { BollaLauncher } from '@/components/bolla/BollaLauncher';
import { LuxeBackground } from '@/components/layout/LuxeBackground';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz'],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);

  const messages = await getMessages();

  // Stato di login letto lato server (i cookie qui si leggono senza problemi)
  // e passato al Nav, così il menù riflette subito login/admin senza dipendere
  // dal client (che in dev può restare appeso sul lock auth di Supabase).
  let isLoggedIn = false;
  let isAdmin = false;
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      isLoggedIn = true;
      const svc = createSupabaseServiceClient();
      const { data } = await svc
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      isAdmin = data?.role === 'admin';
    }
  } catch {
    /* in caso di errore il menù resta in modalità ospite */
  }

  return (
    <html lang={locale} className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen overflow-x-hidden">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <LuxeBackground />
          <Nav isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
          <main className="relative">{children}</main>
          <Footer />
          <FloatingActions />
          <BollaLauncher />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
