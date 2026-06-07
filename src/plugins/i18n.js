import { createI18n } from 'vue-i18n';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  isSupportedLocale,
} from '@/constants/localeConstants';
import en from '@/locales/en.json';
import vi from '@/locales/vi.json';

const normalizeLocale = (value = DEFAULT_LOCALE) => {
  const safeLocale = String(value || '').toLowerCase();
  return isSupportedLocale(safeLocale) ? safeLocale : DEFAULT_LOCALE;
};

const getLocaleFromStorage = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const savedLocale = String(window.localStorage.getItem(LOCALE_STORAGE_KEY) || '').toLowerCase();
  return normalizeLocale(savedLocale);
};

export const createAppI18n = (initialLocale = getLocaleFromStorage()) => createI18n({
  legacy: false,
  locale: normalizeLocale(initialLocale),
  fallbackLocale: DEFAULT_LOCALE,
  warnHtmlMessage: false,
  messages: {
    vi,
    en,
  },
});

export let i18n = createAppI18n();

export const setI18nInstance = (instance) => {
  i18n = instance || createAppI18n();
};

export const persistLocale = (locale) => {
  if (typeof window === 'undefined') {
    return;
  }

  const safeLocale = normalizeLocale(locale);
  window.localStorage.setItem(LOCALE_STORAGE_KEY, safeLocale);
  document.cookie = `${LOCALE_STORAGE_KEY}=${encodeURIComponent(safeLocale)}; Path=/; Max-Age=31536000; SameSite=Lax`;
};

export const getSupportedLocales = () => {
  return [...SUPPORTED_LOCALES];
};

export { i18n as default };
