export const SUPPORTED_LOCALES = Object.freeze(['vi', 'en']);
export const DEFAULT_LOCALE = 'vi';
export const LOCALE_STORAGE_KEY = 'vietnews_locale';

export const HREFLANG_MAP = Object.freeze({
  vi: 'vi-VN',
  en: 'en-US',
});

export const FALLBACK_HREFLANG = 'x-default';

export const isSupportedLocale = (value = '') => {
  return SUPPORTED_LOCALES.includes(String(value || '').toLowerCase());
};
