import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Fraunces } from 'next/font/google';
import { locales, type Locale } from '@/i18n';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { FloatingActions } from '@/components/layout/FloatingActions';
import { BollaLauncher } from '@/components/bolla/BollaLauncher';

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

  return (
    <html lang={locale} className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen overflow-x-hidden">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Nav />
          <main className="relative">{children}</main>
          <Footer />
          <FloatingActions />
          <BollaLauncher />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
