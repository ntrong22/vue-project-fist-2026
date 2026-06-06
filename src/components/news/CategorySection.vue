<template>
  <section :aria-labelledby="headingId" class="mt-8">
    <div class="mb-4 flex items-center justify-between">
      <h2 :id="headingId" class="text-2xl font-bold text-slate-900">{{ displayCategoryName }}</h2>
      <RouterLink :to="`/danh-muc/${props.category.slug}`" class="text-sm font-medium text-brand-700 hover:text-brand-800">
        {{ t('common.all') }}
      </RouterLink>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <NewsCard v-for="item in props.items" :key="item.id" :item="item" />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import NewsCard from '@/components/news/NewsCard.vue';
import { getLocalizedContent } from '@/utils/localizedContent';

const props = defineProps({
  category: {
    type: Object,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
});
const { t, locale } = useI18n({ useScope: 'global' });

const headingId = computed(() => `category-section-${props.category.slug || props.category.id || 'news'}`);
const displayCategoryName = computed(() => getLocalizedContent(props.category, 'name', locale.value));
</script>
