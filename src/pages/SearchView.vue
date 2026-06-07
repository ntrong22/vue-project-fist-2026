<template>
  <section class="container-wide pt-6">
    <Breadcrumb :items="[{ label: t('searchPage.breadcrumb') }]" />

    <div class="mb-6 card-surface p-4 sm:p-5">
      <SearchBox
        v-model="searchKeyword"
        input-id="search-page-input"
        :placeholder="t('searchPage.placeholder')"
        @search="handleSearch"
      />
    </div>

    <h1 class="mb-4 text-3xl font-bold text-slate-900">{{ t('searchPage.title') }}</h1>

    <p class="mb-5 text-sm text-slate-600" v-if="searchResult.query">
      {{ t('searchPage.keywordLabel', { keyword: searchResult.query, count: searchResult.pagination.totalItems }) }}
    </p>

    <LoadingSkeleton v-if="isLoading" :count="6" type="card" />

    <EmptyState
      v-else-if="errorMessage"
      :title="t('searchPage.loadErrorTitle')"
      :description="errorMessage"
    />

    <EmptyState
      v-else-if="!searchResult.query"
      :title="t('searchPage.emptyKeywordTitle')"
      :description="t('searchPage.emptyKeywordDescription')"
    />

    <EmptyState
      v-else-if="!searchResult.items.length"
      :title="t('searchPage.emptyResultTitle')"
      :description="t('searchPage.emptyResultDescription')"
    />

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <NewsCard v-for="item in searchResult.items" :key="item.id" :item="item" />
      </div>

      <Pagination
        :page="searchResult.pagination.page"
        :total-pages="searchResult.pagination.totalPages"
        @change="handlePageChange"
      />
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, onServerPrefetch, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Breadcrumb from '@/components/common/Breadcrumb.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue';
import Pagination from '@/components/common/Pagination.vue';
import SearchBox from '@/components/common/SearchBox.vue';
import NewsCard from '@/components/news/NewsCard.vue';
import { useDebounce } from '@/composables/useDebounce';
import { useNewsStore } from '@/stores/useNewsStore';
import {
  buildAlternateLocaleLinks,
  buildLocalizedCanonicalUrl,
  useSeoHead,
} from '@/utils/seoHelper';
import { normalizeSearchInput } from '@/utils/sanitizeHtml';

const route = useRoute();
const router = useRouter();
const newsStore = useNewsStore();
const { t, locale } = useI18n({ useScope: 'global' });

const searchKeyword = ref('');

const searchResult = computed(() => newsStore.searchResult);
const isLoading = computed(() => newsStore.loading.search);
const errorMessage = computed(() => newsStore.error.search);

const pageFromQuery = computed(() => {
  const value = Number(route.query.page || 1);
  return Number.isNaN(value) || value < 1 ? 1 : value;
});

const safeSearchQuery = computed(() => {
  const rawQuery = route.query.q ? String(route.query.q) : '';
  return normalizeSearchInput(rawQuery);
});

const searchSeoMeta = computed(() => {
  const title = safeSearchQuery.value
    ? t('seo.search.titleWithKeyword', { keyword: safeSearchQuery.value })
    : t('seo.search.title');

  const description = safeSearchQuery.value
    ? t('seo.search.descriptionWithKeyword', { keyword: safeSearchQuery.value })
    : t('seo.search.description');

  return {
    title,
    description,
    keywords: safeSearchQuery.value
      ? t('seo.search.keywordsWithKeyword', { keyword: safeSearchQuery.value })
      : t('seo.search.keywords'),
    canonical: buildLocalizedCanonicalUrl('/tim-kiem', locale.value),
    robots: 'noindex, follow',
    locale: locale.value,
    alternates: buildAlternateLocaleLinks('/tim-kiem'),
  };
});

useSeoHead(searchSeoMeta);

const { run: runSearchDebounce, cancel: cancelSearchDebounce } = useDebounce((value) => {
  const safeQuery = normalizeSearchInput(value);
  const currentRouteQuery = route.query.q ? String(route.query.q) : '';

  if (safeQuery === currentRouteQuery) {
    return;
  }

  router.push({
    path: '/tim-kiem',
    query: safeQuery ? { q: safeQuery } : {},
  });
}, 450);

const loadSearch = async () => {
  const safeQuery = safeSearchQuery.value;
  searchKeyword.value = safeQuery;

  await newsStore.searchNews(safeQuery, pageFromQuery.value);
};

const handleSearch = (keyword) => {
  cancelSearchDebounce();
  const safeQuery = normalizeSearchInput(keyword);

  router.push({
    path: '/tim-kiem',
    query: safeQuery ? { q: safeQuery } : {},
  });
};

const handlePageChange = (nextPage) => {
  const currentQuery = searchResult.value.query;

  router.push({
    path: '/tim-kiem',
    query: {
      ...(currentQuery ? { q: currentQuery } : {}),
      ...(nextPage > 1 ? { page: String(nextPage) } : {}),
    },
  });
};

onServerPrefetch(loadSearch);

onMounted(loadSearch);

watch(
  () => [route.query.q, route.query.page, locale.value],
  async () => {
    await loadSearch();
  },
);

watch(searchKeyword, (nextKeyword) => {
  runSearchDebounce(nextKeyword);
});
</script>
