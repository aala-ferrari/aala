import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const tBrand = useTranslations('brand');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 border-t border-ink-line bg-canvas-warm/40">
      <div className="container-aala grid grid-cols-2 gap-10 py-16 md:grid-cols-4">
        <div className="col-span-2">
          <p className="font-display text-2xl text-ink">{tBrand('name')}</p>
          <p className="mt-2 max-w-xs text-sm text-ink-soft">{tBrand('tagline')}</p>
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
          <p>Auto · Legal · CRM · Medical · Webpages</p>
        </div>
      </div>
    </footer>
  );
}
