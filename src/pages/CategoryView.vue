<template>
  <section class="container-wide pt-6">
    <Breadcrumb :items="breadcrumbItems" />

    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_340px]">
      <div>
        <h1 class="mb-5 text-3xl font-bold text-slate-900">{{ pageTitle }}</h1>

        <LoadingSkeleton v-if="isLoading" :count="6" type="card" />

        <EmptyState
          v-else-if="errorMessage"
          :title="t('categoryPage.loadErrorTitle')"
          :description="errorMessage"
        />

        <EmptyState
          v-else-if="!categoryNews.category"
          :title="t('categoryPage.notFoundTitle')"
          :description="t('categoryPage.notFoundDescription')"
        />

        <template v-else>
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <NewsCard v-for="item in categoryNews.items" :key="item.id" :item="item" />
          </div>

          <Pagination
            :page="categoryNews.pagination.page"
            :total-pages="categoryNews.pagination.totalPages"
            @change="handlePageChange"
          />
        </template>
      </div>

      <aside class="space-y-5">
        <SidebarNews :title="t('news.sidebarFeatured')" :items="categoryNews.sidebarItems" />
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

const categoryNews = computed(() => newsStore.categoryNews);
const isLoading = computed(() => newsStore.loading.category);
const errorMessage = computed(() => newsStore.error.category);

const pageFromQuery = computed(() => {
  const value = Number(route.query.page || 1);
  return Number.isNaN(value) || value < 1 ? 1 : value;
});

const pageTitle = computed(() => {
  const categoryName = getLocalizedContent(categoryNews.value.category, 'name', locale.value);

  return categoryNews.value.category
    ? t('categoryPage.titlePrefix', { name: categoryName })
    : t('categoryPage.defaultTitle');
});

const breadcrumbItems = computed(() => {
  if (categoryNews.value.category) {
    return [{ label: getLocalizedContent(categoryNews.value.category, 'name', locale.value) }];
  }

  return [{ label: t('common.category') }];
});

const canonicalQuery = computed(() => (pageFromQuery.value > 1 ? { page: pageFromQuery.value } : {}));
const categoryCanonicalUrl = computed(() => {
  const slug = categoryNews.value.category?.slug || String(route.params.slug || '');
  const path = slug ? `/danh-muc/${slug}` : '/danh-muc';

  return buildLocalizedCanonicalUrl(path, locale.value, canonicalQuery.value);
});

const categorySeoMeta = computed(() => {
  if (categoryNews.value.category) {
    const category = categoryNews.value.category;
    const categoryName = getLocalizedContent(category, 'name', locale.value);
    const categoryDescription = getLocalizedContent(category, 'description', locale.value);

    return {
      title: `${categoryName} - VietNews 24h`,
      description: categoryDescription,
      keywords: `${categoryName}, vietnews 24h`,
      canonical: categoryCanonicalUrl.value,
      robots: 'index, follow, max-image-preview:large',
      locale: locale.value,
      alternates: buildAlternateLocaleLinks(`/danh-muc/${category.slug}`, canonicalQuery.value),
    };
  }

  return {
    title: t('seo.categoryNotFound.title'),
    description: t('seo.categoryNotFound.description'),
    keywords: t('seo.categoryNotFound.keywords'),
    canonical: buildLocalizedCanonicalUrl('/danh-muc', locale.value),
    robots: 'noindex, follow',
    locale: locale.value,
    alternates: buildAlternateLocaleLinks('/danh-muc'),
  };
});

const categoryStructuredDataEntries = computed(() => {
  const category = categoryNews.value.category;

  if (!category) {
    return [];
  }

  const items = categoryNews.value.items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: getLocalizedContent(item, 'title', locale.value),
    url: buildLocalizedCanonicalUrl(buildNewsPath(item.slug), locale.value),
  }));

  return [
    {
      id: 'category-breadcrumb',
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
            name: getLocalizedContent(category, 'name', locale.value),
            item: categoryCanonicalUrl.value,
          },
        ],
      },
    },
    {
      id: 'category-collection',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${t('common.category')} ${getLocalizedContent(category, 'name', locale.value)} - VietNews 24h`,
        description: getLocalizedContent(category, 'description', locale.value),
        url: categoryCanonicalUrl.value,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: items.length,
          itemListElement: items,
        },
      },
    },
  ];
});

useSeoHead(categorySeoMeta);
useStructuredDataHead(categoryStructuredDataEntries);

const loadCategory = async () => {
  const slug = String(route.params.slug || '');
  await newsStore.fetchCategoryNews(slug, pageFromQuery.value);
};

const handlePageChange = (nextPage) => {
  router.push({
    path: `/danh-muc/${route.params.slug}`,
    query: nextPage > 1 ? { page: String(nextPage) } : {},
  });
};

onServerPrefetch(loadCategory);

onMounted(loadCategory);

watch(
  () => [route.params.slug, route.query.page, locale.value],
  async () => {
    await loadCategory();
  },
);

</script>
