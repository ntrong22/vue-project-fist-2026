import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isSupportedLocale } from '@/constants/localeConstants';
import { createAppI18n, persistLocale, setI18nInstance } from '@/plugins/i18n';

const normalizeLocale = (value) => {
  const safeLocale = String(value || '').toLowerCase();
  return isSupportedLocale(safeLocale) ? safeLocale : DEFAULT_LOCALE;
};

export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute();
  const localeCookie = useCookie(LOCALE_STORAGE_KEY, {
    default: () => DEFAULT_LOCALE,
    sameSite: 'lax',
    path: '/',
  });

  const queryLocale = Array.isArray(route.query.lang) ? route.query.lang[0] : route.query.lang;
  const initialLocale = normalizeLocale(queryLocale || localeCookie.value);
  const i18n = createAppI18n(initialLocale);

  setI18nInstance(i18n);
  nuxtApp.vueApp.use(i18n);

  if (import.meta.client) {
    persistLocale(initialLocale);
  }
});
