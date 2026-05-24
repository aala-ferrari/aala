import type { Metadata } from 'next';
import { ContactForm } from '@/components/sections/ContactForm';
import { Mail, MapPin, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contatti',
  description: 'Parla con il team AALA.',
};

export default function ContactPage() {
  return (
    <section className="pt-32 pb-24">
      <div className="container-aala">
        <div className="grid gap-16 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h1 className="font-display text-5xl tracking-tight sm:text-6xl">
              <span className="gold-text">Parliamone.</span>
            </h1>
            <p className="mt-6 text-lg text-ink-soft">
              Raccontaci il tuo progetto. Ti rispondiamo entro 24 ore con un percorso su misura.
            </p>

            <ul className="mt-12 space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-gold" />
                <a href="mailto:hello@aala.example" className="text-ink hover:text-gold">
                  hello@aala.example
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-gold" />
                <span className="text-ink-soft">+39 — da configurare</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-gold" />
                <span className="text-ink-soft">Tirana · Milano</span>
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
