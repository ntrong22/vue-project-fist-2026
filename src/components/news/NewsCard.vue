<template>
  <article class="card-surface group overflow-hidden">
    <NuxtLink :to="newsPath" class="block overflow-hidden">
      <img
        :src="item.thumbnail"
        :alt="displayTitle"
        class="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        loading="lazy"
        @error="onImageError"
      />
    </NuxtLink>

    <div class="p-4">
      <NuxtLink
        :to="categoryPath"
        class="mb-2 inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
      >
        {{ displayCategoryName }}
      </NuxtLink>

      <h3 class="line-clamp-2 text-lg font-bold leading-snug text-slate-900">
        <NuxtLink :to="newsPath" class="transition group-hover:text-brand-700">{{ displayTitle }}</NuxtLink>
      </h3>

      <p class="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{{ displaySummary }}</p>

      <div class="mt-4 flex items-center justify-between gap-2 text-xs text-slate-500">
        <span>{{ formatDateOnly(item.publishedAt, dateLocale) }}</span>
        <span class="truncate">{{ displayAuthor }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import appConfig from '@/config/appConfig';
import { formatDateOnly } from '@/utils/dateHelper';
import { getLocalizedContent } from '@/utils/localizedContent';
import { buildCategoryPath, buildNewsPath, generateSlug } from '@/utils/slugHelper';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});
const { locale } = useI18n({ useScope: 'global' });

const displayTitle = computed(() => getLocalizedContent(props.item, 'title', locale.value));
const displaySummary = computed(() => getLocalizedContent(props.item, 'summary', locale.value));
const displayCategoryName = computed(() => getLocalizedContent(props.item, 'categoryName', locale.value));
const displayAuthor = computed(() => getLocalizedContent(props.item, 'author', locale.value));
const dateLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'vi-VN'));

const newsPath = computed(() => buildNewsPath(props.item.slug));
const categoryPath = computed(() => {
  const safeCategorySlug = props.item.categorySlug || generateSlug(displayCategoryName.value);
  return buildCategoryPath(safeCategorySlug);
});

const onImageError = (event) => {
  event.target.src = appConfig.fallbackImage;
};
</script>
