<template>
  <section aria-labelledby="latest-news-heading">
    <div class="mb-5 flex items-center justify-between">
      <h2 id="latest-news-heading" class="section-title mb-0">{{ t('news.latest') }}</h2>
      <NuxtLink to="/tin-tuc" class="text-sm font-medium text-brand-700 hover:text-brand-800">{{ t('common.readMore') }}</NuxtLink>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <NewsCard v-for="item in items" :key="item.id" :item="item" />
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import NewsCard from '@/components/news/NewsCard.vue';

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const { t } = useI18n({ useScope: 'global' });
</script>
