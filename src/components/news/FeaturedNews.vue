<template>
  <section aria-labelledby="featured-news-heading" class="space-y-4">
    <h2 id="featured-news-heading" class="section-title">{{ t('news.featured') }}</h2>

    <div v-if="items.length" class="grid gap-4 lg:grid-cols-3">
      <article class="relative overflow-hidden rounded-2xl lg:col-span-2">
        <NuxtLink :to="buildNewsPath(items[0].slug)" class="block">
          <img
            :src="items[0].thumbnail"
            :alt="getText(items[0], 'title')"
            class="h-[360px] w-full object-cover"
            loading="lazy"
            @error="onImageError"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/35 to-transparent" />
          <div class="absolute bottom-0 p-6 text-white">
            <p class="mb-2 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-xs">{{ getText(items[0], 'categoryName') }}</p>
            <h3 class="text-2xl font-bold leading-tight lg:text-3xl">{{ getText(items[0], 'title') }}</h3>
            <p class="mt-3 line-clamp-2 text-sm text-slate-100">{{ getText(items[0], 'summary') }}</p>
          </div>
        </NuxtLink>
      </article>

      <div class="space-y-4">
        <NewsCard v-for="item in items.slice(1, 4)" :key="item.id" :item="item" />
      </div>
    </div>

    <div v-else class="card-surface p-6 text-sm text-slate-600">{{ t('news.featuredEmpty') }}</div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import appConfig from '@/config/appConfig';
import NewsCard from '@/components/news/NewsCard.vue';
import { getLocalizedContent } from '@/utils/localizedContent';
import { buildNewsPath } from '@/utils/slugHelper';

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});
const { t, locale } = useI18n({ useScope: 'global' });

const getText = (item, field) => getLocalizedContent(item, field, locale.value);

const onImageError = (event) => {
  event.target.src = appConfig.fallbackImage;
};
</script>
