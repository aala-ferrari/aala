import { getRequestConfig } from 'next-intl/server';

export { locales, defaultLocale, type Locale } from './i18n-config';
import { locales, defaultLocale, type Locale } from './i18n-config';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (locales as readonly string[]).includes(requested ?? '')
    ? (requested as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
