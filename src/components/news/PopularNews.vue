<template>
  <section aria-labelledby="popular-news-heading" class="card-surface p-5">
    <h2 id="popular-news-heading" class="mb-4 text-xl font-bold text-slate-900">{{ t('news.popular') }}</h2>

    <ol class="space-y-4">
      <li v-for="(item, index) in items" :key="item.id" class="flex gap-3">
        <span class="mt-1 text-xl font-bold text-brand-600">{{ index + 1 }}</span>
        <div>
          <RouterLink :to="buildNewsPath(item.slug)" class="line-clamp-2 font-medium text-slate-800 hover:text-brand-700">
            {{ getText(item, 'title') }}
          </RouterLink>
          <p class="mt-1 text-xs text-slate-500">{{ formatViewCount(item.viewCount) }} {{ t('common.views') }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
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
const formatViewCount = (value) => Number(value || 0).toLocaleString(locale.value === 'en' ? 'en-US' : 'vi-VN');
</script>
