<template>
  <div class="container-wide pt-6">
    <h1 class="sr-only">{{ t('home.srTitle') }}</h1>
    <FeaturedNews :items="homeData.featured" />

    <section class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
      <div class="space-y-8">
        <LoadingSkeleton v-if="isLoading" :count="6" type="card" />

        <EmptyState
          v-else-if="errorMessage"
          :title="t('home.errorTitle')"
          :description="errorMessage"
        />

        <template v-else>
          <LatestNews :items="homeData.latest.slice(0, 6)" />

          <PopularNews :items="homeData.popular.slice(0, 5)" />

          <section aria-labelledby="hot-news-heading">
            <h2 id="hot-news-heading" class="section-title">{{ t('home.hotTitle') }}</h2>
            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <NewsCard v-for="item in homeData.hot.slice(0, 6)" :key="item.id" :item="item" />
            </div>
          </section>

          <CategorySection
            v-for="section in categorySections"
            :key="section.category.id"
            :category="section.category"
            :items="section.items"
          />
        </template>
      </div>

      <aside class="space-y-5" :aria-label="t('news.sidebarFeatured')">
        <SidebarNews :title="t('home.topReads')" :items="homeData.sidebar.topReads" />
        <SidebarNews :title="t('home.hotPicks')" :items="homeData.sidebar.hotPicks" />
      </aside>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onServerPrefetch } from 'vue';
import { useI18n } from 'vue-i18n';
import CategorySection from '@/components/news/CategorySection.vue';
import FeaturedNews from '@/components/news/FeaturedNews.vue';
import LatestNews from '@/components/news/LatestNews.vue';
import NewsCard from '@/components/news/NewsCard.vue';
import PopularNews from '@/components/news/PopularNews.vue';
import SidebarNews from '@/components/news/SidebarNews.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { useNewsStore } from '@/stores/useNewsStore';
import {
  buildAlternateLocaleLinks,
  buildLocalizedCanonicalUrl,
  useSeoHead,
  useStructuredDataHead,
} from '@/utils/seoHelper';
import { getLocalizedContent } from '@/utils/localizedContent';
import { buildNewsPath } from '@/utils/slugHelper';

const newsStore = useNewsStore();
const categoryStore = useCategoryStore();
const { t, locale } = useI18n({ useScope: 'global' });

const homeData = computed(() => newsStore.homeData);
const isLoading = computed(() => newsStore.loading.home);
const errorMessage = computed(() => newsStore.error.home);

const categorySections = computed(() => {
  return homeData.value.categorySections.filter((section) => section.items.length > 0);
});

const homeCanonicalUrl = computed(() => buildLocalizedCanonicalUrl('/', locale.value));

const homeSeoMeta = computed(() => ({
  title: t('seo.home.title'),
  description: t('seo.home.description'),
  keywords: t('seo.home.keywords'),
  canonical: homeCanonicalUrl.value,
  locale: locale.value,
  alternates: buildAlternateLocaleLinks('/'),
}));

const homeStructuredDataEntries = computed(() => {
  const latestItems = homeData.value.latest.slice(0, 10);
  const itemListElement = latestItems.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: getLocalizedContent(item, 'title', locale.value),
    url: buildLocalizedCanonicalUrl(buildNewsPath(item.slug), locale.value),
  }));

  return [
    {
      id: 'home-collection',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: t('seo.home.title'),
        description: t('seo.home.description'),
        url: homeCanonicalUrl.value,
        mainEntity: {
          '@type': 'ItemList',
          itemListOrder: 'https://schema.org/ItemListOrderDescending',
          numberOfItems: itemListElement.length,
          itemListElement,
        },
      },
    },
  ];
});

useSeoHead(homeSeoMeta);
useStructuredDataHead(homeStructuredDataEntries);

const loadHome = async () => {
  if (!categoryStore.hasCategories) {
    await categoryStore.fetchCategories();
  }

  await newsStore.fetchHomeNews();
};

onServerPrefetch(loadHome);

onMounted(loadHome);
</script>
