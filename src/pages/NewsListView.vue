<template>
  <section class="container-wide pt-6">
    <Breadcrumb :items="[{ label: t('news.latest') }]" />

    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_340px]">
      <div>
        <h1 class="mb-2 text-3xl font-bold text-slate-900">{{ t('news.latestPageTitle') }}</h1>
        <p class="mb-5 text-sm text-slate-600">
          {{ t('news.latestCount', { count: newsList.pagination.totalItems }) }}
        </p>

        <LoadingSkeleton v-if="isLoading" :count="6" type="card" />

        <EmptyState
          v-else-if="errorMessage"
          :title="t('news.listLoadError')"
          :description="errorMessage"
        />

        <EmptyState
          v-else-if="!newsList.items.length"
          :title="t('news.listEmptyTitle')"
          :description="t('news.listEmptyDescription')"
        />

        <template v-else>
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <NewsCard v-for="item in newsList.items" :key="item.id" :item="item" />
          </div>

          <Pagination
            :page="newsList.pagination.page"
            :total-pages="newsList.pagination.totalPages"
            @change="handlePageChange"
          />
        </template>
      </div>

      <aside class="space-y-5">
        <SidebarNews :title="t('home.topReads')" :items="newsList.sidebarItems" />
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onServerPrefetch, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Breadcrumb from '@/components/common/Breadcrumb.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue';
import Pagination from '@/components/common/Pagination.vue';
import NewsCard from '@/components/news/NewsCard.vue';
import SidebarNews from '@/components/news/SidebarNews.vue';
import { useNewsStore } from '@/stores/useNewsStore';
import {
  buildAlternateLocaleLinks,
  buildLocalizedCanonicalUrl,
  useSeoHead,
  useStructuredDataHead,
} from '@/utils/seoHelper';
import { getLocalizedContent } from '@/utils/localizedContent';
import { buildNewsPath } from '@/utils/slugHelper';

const route = useRoute();
const router = useRouter();
const newsStore = useNewsStore();
const { t, locale } = useI18n({ useScope: 'global' });

const newsList = computed(() => newsStore.newsList);
const isLoading = computed(() => newsStore.loading.list);
const errorMessage = computed(() => newsStore.error.list);

const pageFromQuery = computed(() => {
  const value = Number(route.query.page || 1);
  return Number.isNaN(value) || value < 1 ? 1 : value;
});

const canonicalQuery = computed(() => (pageFromQuery.value > 1 ? { page: pageFromQuery.value } : {}));
const newsListCanonicalUrl = computed(() =>
  buildLocalizedCanonicalUrl('/tin-tuc', locale.value, canonicalQuery.value),
);

const newsListSeoMeta = computed(() => ({
  title: t('seo.newsList.title'),
  description: t('seo.newsList.description'),
  keywords: t('seo.newsList.keywords'),
  canonical: newsListCanonicalUrl.value,
  robots: 'index, follow, max-image-preview:large',
  locale: locale.value,
  alternates: buildAlternateLocaleLinks('/tin-tuc', canonicalQuery.value),
}));

const newsListStructuredDataEntries = computed(() => {
  const items = newsList.value.items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: getLocalizedContent(item, 'title', locale.value),
    url: buildLocalizedCanonicalUrl(buildNewsPath(item.slug), locale.value),
  }));

  return [
    {
      id: 'news-list-breadcrumb',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: t('nav.home'),
            item: buildLocalizedCanonicalUrl('/', locale.value),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: t('news.latest'),
            item: newsListCanonicalUrl.value,
          },
        ],
      },
    },
    {
      id: 'news-list-collection',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: t('seo.newsList.title'),
        description: t('seo.newsList.description'),
        url: newsListCanonicalUrl.value,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: items.length,
          itemListElement: items,
        },
      },
    },
  ];
});

useSeoHead(newsListSeoMeta);
useStructuredDataHead(newsListStructuredDataEntries);

const loadNewsList = async () => {
  await newsStore.fetchNewsList(pageFromQuery.value);
};

const handlePageChange = (nextPage) => {
  router.push({
    path: '/tin-tuc',
    query: nextPage > 1 ? { page: String(nextPage) } : {},
  });
};

onServerPrefetch(loadNewsList);

onMounted(loadNewsList);

watch(
  () => [route.query.page, locale.value],
  async () => {
    await loadNewsList();
  },
);

</script>
