'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { Menu, X, Globe, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { locales } from '@/i18n';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const LANG_LABEL: Record<string, string> = {
  it: 'IT', en: 'EN', es: 'ES', fr: 'FR', de: 'DE', sq: 'SQ',
};

export function Nav({
  isLoggedIn = false,
  isAdmin = false,
}: {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
}) {
  const t = useTranslations('nav');
  const tBrand = useTranslations('brand');
  const locale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // stato auth deciso dal server (cookie letti lato server, niente hang del client)
  const auth: 'in' | 'out' = isLoggedIn ? 'in' : 'out';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logout = async () => {
    try {
      await createSupabaseBrowserClient().auth.signOut();
    } catch {
      /* ignora: facciamo comunque il redirect */
    }
    window.location.href = `/${locale}`;
  };

  const links = [
    { href: `/${locale}#services`, label: t('services') },
    { href: `/${locale}/prezzi`, label: t('pricing') },
    { href: `/${locale}/chi-siamo`, label: t('about') },
    { href: `/${locale}/contatti`, label: t('contact') },
  ];

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-ink-line/70 bg-canvas/80 backdrop-blur-xl'
          : 'bg-transparent'
      )}
    >
      <div className="container-aala flex h-16 items-center justify-between">
        <Link href={`/${locale}`} className="group flex items-center gap-2.5">
          <LogoMark />
          <span className="font-display text-lg tracking-tight text-ink">
            {tBrand('short')}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-ink-soft transition hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative block">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-ink-line bg-canvas-paper/60 px-3 py-1.5 text-xs text-ink-soft transition hover:text-ink"
              aria-label="Cambia lingua"
            >
              <Globe className="h-3.5 w-3.5" />
              {LANG_LABEL[locale]}
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-[120px] overflow-hidden rounded-xl border border-ink-line bg-canvas-paper shadow-soft">
                {locales.map((l) => (
                  <Link
                    key={l}
                    href={`/${l}`}
                    onClick={() => setLangOpen(false)}
                    className={cn(
                      'block px-4 py-2 text-xs transition hover:bg-canvas-warm/60',
                      l === locale ? 'text-gold font-medium' : 'text-ink-soft'
                    )}
                  >
                    {LANG_LABEL[l]}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {auth === 'in' ? (
            <div className="hidden items-center gap-3 md:flex">
              {isAdmin && (
                <Link
                  href={`/${locale}/admin/leads`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-gold/20"
                >
                  <Brain className="h-3.5 w-3.5 text-gold" /> {t('admin')}
                </Link>
              )}
              <Link
                href={`/${locale}/account`}
                className="text-sm text-ink-soft transition hover:text-ink"
              >
                {t('account')}
              </Link>
              <button
                onClick={logout}
                className="text-sm text-ink-soft transition hover:text-ink"
              >
                {t('logout')}
              </button>
            </div>
          ) : auth === 'out' ? (
            <>
              <Link
                href={`/${locale}/login`}
                className="hidden text-sm text-ink-soft transition hover:text-ink md:inline"
              >
                {t('login')}
              </Link>
              <Link href={`/${locale}/signup`} className="btn-primary hidden md:inline-flex">
                {t('signup')}
              </Link>
            </>
          ) : null}

          <button
            className="md:hidden text-ink"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink-line bg-canvas-paper/95 backdrop-blur md:hidden">
          <div className="container-aala flex flex-col gap-4 py-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-base text-ink-soft hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            {auth === 'in' ? (
              <div className="flex flex-col gap-2 pt-2">
                {isAdmin && (
                  <Link
                    href={`/${locale}/admin/leads`}
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 px-4 py-2 text-sm font-medium text-ink"
                  >
                    <Brain className="h-3.5 w-3.5 text-gold" /> {t('admin')}
                  </Link>
                )}
                <Link
                  href={`/${locale}/account`}
                  onClick={() => setOpen(false)}
                  className="btn-ghost justify-center"
                >
                  {t('account')}
                </Link>
                <button onClick={logout} className="btn-ghost justify-center">
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href={`/${locale}/login`} className="btn-ghost flex-1 justify-center">
                  {t('login')}
                </Link>
                <Link href={`/${locale}/signup`} className="btn-primary flex-1 justify-center">
                  {t('signup')}
                </Link>
              </div>
            )}
            <div className="flex gap-2 pt-3">
              {locales.map((l) => (
                <Link
                  key={l}
                  href={`/${l}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'rounded-full border border-ink-line px-3 py-1 text-xs',
                    l === locale ? 'text-gold font-medium' : 'text-ink-soft'
                  )}
                >
                  {LANG_LABEL[l]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ecdcb0" />
          <stop offset="0.5" stopColor="#c9a849" />
          <stop offset="1" stopColor="#8a6717" />
        </linearGradient>
      </defs>
      <path
        d="M16 3 L29 27 H22 L20 22 H12 L10 27 H3 Z M14 17 H18 L16 12 Z"
        fill="url(#lg)"
      />
    </svg>
  );
}
