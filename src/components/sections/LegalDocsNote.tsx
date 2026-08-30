import { useTranslations } from 'next-intl';
import { FileText, ArrowUpRight } from 'lucide-react';

/**
 * Una riga sola: i documenti legali di Super Avokati, leggibili prima di firmare.
 *
 * Sta **solo** sulla pagina del verticale legale, sotto i prezzi. Non nel
 * footer: li' comparirebbe anche sulle pagine di taxi, auto e dental, dove un
 * link alle condizioni di un altro prodotto e' rumore. Qui invece e'
 * esattamente dove si trova chi sta decidendo — uno studio strutturato, prima
 * di aprire un account, manda il proprio responsabile protezione dati a
 * leggere l'accordo sul trattamento.
 *
 * Discreta di proposito: nessun riquadro, nessun colore d'allarme, il peso
 * visivo di una nota a pie' di sezione. Non deve vendere, deve esserci.
 */
export function LegalDocsNote({ locale }: { locale: string }) {
  const t = useTranslations('legalDocsNote');
  // Il portale parla 6 lingue, i documenti ne hanno due: chi non e' italiano
  // legge l'albanese, che e' la lingua dell'originale.
  const lingua = locale === 'it' ? 'it' : 'sq';

  return (
    <section className="relative pt-10 sm:pt-14">
      <div className="container-aala">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 border-t border-ink-line/70 pt-8 text-center sm:flex-row sm:gap-4 sm:text-left">
          <FileText className="h-5 w-5 shrink-0 text-gold/70" aria-hidden="true" />
          <p className="text-[13px] leading-relaxed text-ink-mute">
            {t('text')}{' '}
            <a
              href={`https://superavokati.ai/legale/${lingua}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-ink-soft underline decoration-gold/40 underline-offset-4 transition hover:text-ink hover:decoration-gold"
            >
              {t('link')}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
