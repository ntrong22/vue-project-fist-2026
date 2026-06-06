import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/constants/localeConstants';
import { persistLocale } from '@/plugins/i18n';

const normalizeLocale = (value = DEFAULT_LOCALE) => {
  const safeLocale = String(value || '').toLowerCase();
  return SUPPORTED_LOCALES.includes(safeLocale) ? safeLocale : DEFAULT_LOCALE;
};

export const useLocale = () => {
  const { locale } = useI18n({ useScope: 'global' });

  const currentLocale = computed(() => normalizeLocale(locale.value));

  const setLocale = (nextLocale) => {
    const safeLocale = normalizeLocale(nextLocale);
    locale.value = safeLocale;
    persistLocale(safeLocale);
  };

  const toggleLocale = () => {
    const nextLocale = currentLocale.value === 'vi' ? 'en' : 'vi';
    setLocale(nextLocale);
  };

  return {
    locale: currentLocale,
    setLocale,
    toggleLocale,
    locales: [...SUPPORTED_LOCALES],
  };
};

export default useLocale;
