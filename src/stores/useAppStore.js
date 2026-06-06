import { defineStore } from 'pinia';
import appConfig from '@/config/appConfig';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isSupportedLocale } from '@/constants/localeConstants';

const getInitialLocale = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const savedLocale = String(window.localStorage.getItem(LOCALE_STORAGE_KEY) || '').toLowerCase();
  return isSupportedLocale(savedLocale) ? savedLocale : DEFAULT_LOCALE;
};

export const useAppStore = defineStore('app', {
  state: () => ({
    appName: appConfig.appName,
    locale: getInitialLocale(),
    isMobileMenuOpen: false,
    globalLoading: false,
    authExpired: false,
    isAuthenticated: false,
  }),
  actions: {
    setMobileMenu(value) {
      this.isMobileMenuOpen = Boolean(value);
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    setGlobalLoading(value) {
      this.globalLoading = Boolean(value);
    },
    setLocale(locale) {
      this.locale = String(locale || DEFAULT_LOCALE).toLowerCase();
    },
    setAuthenticated(value) {
      this.isAuthenticated = Boolean(value);
    },
    markAuthExpired(value = true) {
      this.authExpired = Boolean(value);
    },
  },
});

export default useAppStore;
