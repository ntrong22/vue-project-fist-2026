import { createI18n } from 'vue-i18n';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  isSupportedLocale,
} from '@/constants/localeConstants';
import en from '@/locales/en.json';
import vi from '@/locales/vi.json';

const getLocaleFromStorage = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const savedLocale = String(window.localStorage.getItem(LOCALE_STORAGE_KEY) || '').toLowerCase();
  return isSupportedLocale(savedLocale) ? savedLocale : DEFAULT_LOCALE;
};

export const i18n = createI18n({
  legacy: false,
  locale: getLocaleFromStorage(),
  fallbackLocale: DEFAULT_LOCALE,
  warnHtmlMessage: false,
  messages: {
    vi,
    en,
  },
});

export const persistLocale = (locale) => {
  if (typeof window === 'undefined') {
    return;
  }

  const safeLocale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  window.localStorage.setItem(LOCALE_STORAGE_KEY, safeLocale);
};

export const getSupportedLocales = () => {
  return [...SUPPORTED_LOCALES];
};

export default i18n;
