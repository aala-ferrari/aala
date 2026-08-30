/**
 * Lingue e lingua predefinita — file SENZA dipendenze.
 *
 * Esiste per una ragione precisa: `src/i18n.ts` contiene anche
 * `getRequestConfig`, cioe' codice di next-intl lato server e l'import
 * dinamico di TUTTI i file di messaggi. Il middleware gira nel runtime edge:
 * importando `./i18n` si portava dentro quel bundle anche roba che li' non ci
 * deve stare.
 *
 * Da qui importano sia il middleware sia `i18n.ts`, cosi' la lista delle
 * lingue resta una sola.
 */
export const locales = ['it', 'en', 'es', 'fr', 'de', 'sq'] as const;
export const defaultLocale = 'it' as const;
export type Locale = (typeof locales)[number];
