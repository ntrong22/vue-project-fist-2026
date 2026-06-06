<template>
  <aside class="card-surface p-4">
    <h3 class="mb-4 text-lg font-bold text-slate-900">{{ resolvedTitle }}</h3>
    <ul class="space-y-4">
      <li v-for="item in props.items" :key="item.id" class="flex gap-3">
        <RouterLink :to="buildNewsPath(item.slug)" class="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-200">
          <img
            :src="item.thumbnail"
            :alt="getText(item, 'title')"
            class="h-full w-full object-cover"
            loading="lazy"
            @error="onImageError"
          />
        </RouterLink>

        <div>
          <RouterLink
            :to="buildNewsPath(item.slug)"
            class="line-clamp-2 text-sm font-medium text-slate-800 transition hover:text-brand-700"
          >
            {{ getText(item, 'title') }}
          </RouterLink>
          <p class="mt-1 text-xs text-slate-500">{{ getText(item, 'categoryName') }}</p>
        </div>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import appConfig from '@/config/appConfig';
import { getLocalizedContent } from '@/utils/localizedContent';
import { buildNewsPath } from '@/utils/slugHelper';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    default: () => [],
  },
});
const { t, locale } = useI18n({ useScope: 'global' });

const resolvedTitle = computed(() => props.title || t('news.sidebarFeatured'));
const getText = (item, field) => getLocalizedContent(item, field, locale.value);

const onImageError = (event) => {
  event.target.src = appConfig.fallbackImage;
};
</script>
