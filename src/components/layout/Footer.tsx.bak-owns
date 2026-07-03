import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const tBrand = useTranslations('brand');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-12 border-t border-ink-line bg-canvas-warm/40 sm:mt-16">
      <div className="container-aala grid grid-cols-2 gap-10 py-10 md:grid-cols-4 sm:py-12">
        <div className="col-span-2">
          <Image
            src="/logo-aala-full.png"
            alt="AALA — Albania Auto Legal Alliance"
            width={844}
            height={595}
            className="h-20 w-auto"
          />
          <p className="mt-3 max-w-xs text-sm text-ink-soft">{tBrand('tagline')}</p>
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-ink-mute">Menu</p>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li><Link href={`/${locale}#services`} className="hover:text-ink">{tNav('services')}</Link></li>
            <li><Link href={`/${locale}/prezzi`} className="hover:text-ink">{tNav('pricing')}</Link></li>
            <li><Link href={`/${locale}/chi-siamo`} className="hover:text-ink">{tNav('about')}</Link></li>
            <li><Link href={`/${locale}/contatti`} className="hover:text-ink">{tNav('contact')}</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-ink-mute">Legal</p>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li><Link href={`/${locale}/privacy`} className="hover:text-ink">{t('privacy')}</Link></li>
            <li><Link href={`/${locale}/termini`} className="hover:text-ink">{t('terms')}</Link></li>
            <li><Link href={`/${locale}/cookie`} className="hover:text-ink">{t('cookies')}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-line/70">
        <div className="container-aala flex flex-col items-center justify-between gap-2 py-6 text-xs text-ink-mute md:flex-row">
          <p>© {year} {tBrand('short')}. {t('rights')}</p>
          <p>Auto · Legal · CRM · Medical · Webpages · Taxi App</p>
        </div>
      </div>
    </footer>
  );
}
