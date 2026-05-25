import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContactForm } from '@/components/sections/ContactForm';
import { Mail, MapPin, Phone } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contact');
  return { title: t('eyebrow') };
}

export default async function ContactPage() {
  const t = await getTranslations('contact');

  return (
    <section className="pt-28 pb-16 sm:pt-32 sm:pb-24">
      <div className="container-aala">
        <div className="grid gap-16 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
              {t('eyebrow')}
            </p>
            <h1 className="mt-4 font-display text-5xl tracking-tight sm:text-6xl">
              <span className="gold-text">{t('titleHighlight')}</span>
            </h1>
            <p className="mt-6 text-lg text-ink-soft">{t('subtitle')}</p>

            <ul className="mt-12 space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-gold" />
                <a href="mailto:hello@aala.example" className="text-ink hover:text-gold">
                  hello@aala.example
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-gold" />
                <span className="text-ink-soft">{t('phone')}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-gold" />
                <span className="text-ink-soft">{t('location')}</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
