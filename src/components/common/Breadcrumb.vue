<template>
  <nav aria-label="Breadcrumb" class="mb-5 text-sm">
    <ol class="flex flex-wrap items-center gap-2 text-slate-500">
      <li>
        <RouterLink to="/" class="hover:text-brand-700">{{ t('nav.home') }}</RouterLink>
      </li>
      <li v-for="item in items" :key="`${item.label}-${item.to || 'current'}`" class="flex items-center gap-2">
        <span aria-hidden="true">/</span>
        <RouterLink v-if="item.to" :to="item.to" class="hover:text-brand-700">{{ item.label }}</RouterLink>
        <span v-else class="font-medium text-slate-700" aria-current="page">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const { t } = useI18n({ useScope: 'global' });
</script>
