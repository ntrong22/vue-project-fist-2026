<template>
  <div class="inline-flex items-center rounded-lg border border-slate-300 bg-white p-1">
    <button
      v-for="code in locales"
      :key="code"
      type="button"
      class="rounded-md px-2.5 py-1 text-xs font-semibold transition"
      :class="code === locale ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-100'"
      :aria-label="`${t('language.label')} ${t(`language.${code}`)}`"
      @click="setLocale(code)"
    >
      {{ t(`language.${code}`) }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useLocale } from '@/composables/useLocale';

const { t } = useI18n({ useScope: 'global' });
const { locale, locales, setLocale } = useLocale();
</script>
