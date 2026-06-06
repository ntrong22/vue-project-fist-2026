<template>
  <article class="container-wide pt-6">
    <Breadcrumb :items="breadcrumbItems" />

    <LoadingSkeleton v-if="isLoading" :count="3" type="list" />

    <EmptyState
      v-else-if="errorMessage"
      :title="t('news.detailLoadError')"
      :description="errorMessage"
    />

    <EmptyState
      v-else-if="!newsDetail"
      :title="t('news.detailNotFoundTitle')"
      :description="t('news.detailNotFoundDescription')"
    />

    <template v-else>
      <header class="mb-6">
        <h1 class="mb-4 text-3xl font-bold leading-tight text-slate-900 lg:text-4xl">{{ displayTitle }}</h1>

        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
          <span>{{ formattedDate }}</span>
          <span>{{ t('common.author') }}: {{ displayAuthor }}</span>
          <span>{{ formattedViewCount }} {{ t('common.views') }}</span>
        </div>
      </header>

      <figure class="mb-6 overflow-hidden rounded-2xl bg-slate-200">
        <img
          :src="newsDetail.thumbnail"
          :alt="displayTitle"
          class="h-auto w-full"
          loading="lazy"
          @error="onImageError"
        />
      </figure>

      <section class="card-surface p-6 lg:p-8">
        <div class="rich-content" v-html="sanitizedContent" />

        <div v-if="newsDetail.tags?.length" class="mt-8 border-t border-slate-200 pt-4">
          <h2 class="mb-2 text-base font-semibold text-slate-900">{{ t('common.tags') }}</h2>
          <div class="flex flex-wrap gap-2">
            <RouterLink
              v-for="tag in newsDetail.tags"
              :key="tag"
              :to="{ name: 'search', query: { q: tag } }"
              class="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 transition hover:bg-brand-100 hover:text-brand-700"
            >
              #{{ tag }}
            </RouterLink>
          </div>
        </div>
      </section>

      <section class="mt-10" aria-labelledby="related-news-heading">
        <h2 id="related-news-heading" class="section-title">{{ t('news.related') }}</h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NewsCard v-for="item in relatedNews" :key="item.id" :item="item" />
        </div>
      </section>
    </template>
  </article>
</template>

<script setup>
import { computed, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Breadcrumb from '@/components/common/Breadcrumb.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue';
import NewsCard from '@/components/news/NewsCard.vue';
import appConfig from '@/config/appConfig';
import { useNewsStore } from '@/stores/useNewsStore';
import { formatDate } from '@/utils/dateHelper';
import {
  buildAlternateLocaleLinks,
  buildAbsoluteUrl,
  buildCanonicalUrl,
  buildLocalizedCanonicalUrl,
  removeStructuredData,
  setStructuredData,
  updateSeoMeta,
} from '@/utils/seoHelper';
import { getLocalizedContent } from '@/utils/localizedContent';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
import { buildCategoryPath, generateSlug } from '@/utils/slugHelper';

const route = useRoute();
const newsStore = useNewsStore();
const { t, locale } = useI18n({ useScope: 'global' });

const newsDetail = computed(() => newsStore.newsDetail);
const relatedNews = computed(() => newsStore.relatedNews);
const isLoading = computed(() => newsStore.loading.detail);
const errorMessage = computed(() => newsStore.error.detail);

const displayTitle = computed(() => getLocalizedContent(newsDetail.value, 'title', locale.value));
const displaySummary = computed(() => getLocalizedContent(newsDetail.value, 'summary', locale.value));
const displayCategoryName = computed(() => getLocalizedContent(newsDetail.value, 'categoryName', locale.value));
const displayAuthor = computed(() => getLocalizedContent(newsDetail.value, 'author', locale.value));
const formattedDate = computed(() =>
  formatDate(newsDetail.value?.publishedAt, locale.value === 'en' ? 'en-US' : 'vi-VN'),
);
const formattedViewCount = computed(() =>
  Number(newsDetail.value?.viewCount || 0).toLocaleString(locale.value === 'en' ? 'en-US' : 'vi-VN'),
);

const breadcrumbItems = computed(() => {
  if (!newsDetail.value) {
    return [{ label: t('news.latest') }];
  }

  return [
    {
      label: displayCategoryName.value,
      to: buildCategoryPath(newsDetail.value.categorySlug || generateSlug(displayCategoryName.value)),
    },
    {
      label: displayTitle.value,
    },
  ];
});

const sanitizedContent = computed(() =>
  sanitizeHtml(getLocalizedContent(newsDetail.value, 'content', locale.value) || ''),
);

const applyNewsStructuredData = (item) => {
  const newsUrl = buildLocalizedCanonicalUrl(`/tin-tuc/${item.slug}`, locale.value);
  const categoryUrl = buildLocalizedCanonicalUrl(
    buildCategoryPath(item.categorySlug || generateSlug(displayCategoryName.value)),
    locale.value,
  );

  setStructuredData('news-breadcrumb', {
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
        name: displayCategoryName.value,
        item: categoryUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: displayTitle.value,
        item: newsUrl,
      },
    ],
  });

  setStructuredData('news-article', {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: displayTitle.value,
    description: getLocalizedContent(item, 'seoDescription', locale.value) || displaySummary.value,
    articleBody: displaySummary.value,
    image: [buildAbsoluteUrl(item.thumbnail) || buildCanonicalUrl('/images/og-default.svg')],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': newsUrl,
    },
    author: {
      '@type': 'Person',
      name: displayAuthor.value || t('common.editorialTeam'),
    },
    publisher: {
      '@type': 'Organization',
      name: 'VietNews 24h',
      logo: {
        '@type': 'ImageObject',
        url: buildCanonicalUrl('/favicon.svg'),
      },
    },
    datePublished: item.publishedAt,
    dateModified: item.updatedAt || item.publishedAt,
    articleSection: displayCategoryName.value,
    keywords: item.tags,
  });
};

const clearNewsStructuredData = () => {
  removeStructuredData('news-breadcrumb');
  removeStructuredData('news-article');
};

const loadNewsDetail = async () => {
  const slug = String(route.params.slug || '');
  const item = await newsStore.fetchNewsDetail(slug);

  if (item) {
    const canonicalUrl = buildLocalizedCanonicalUrl(`/tin-tuc/${item.slug}`, locale.value);
    const seoTitle = getLocalizedContent(item, 'seoTitle', locale.value) || displayTitle.value;
    const seoDescription = getLocalizedContent(item, 'seoDescription', locale.value) || displaySummary.value;
    const seoKeywords = getLocalizedContent(item, 'seoKeywords', locale.value);

    updateSeoMeta({
      title: seoTitle,
      description: seoDescription,
      keywords: seoKeywords,
      ogTitle: displayTitle.value,
      ogDescription: displaySummary.value,
      ogImage: item.thumbnail,
      canonical: canonicalUrl,
      ogType: 'article',
      robots: 'index, follow, max-image-preview:large',
      locale: locale.value,
      alternates: buildAlternateLocaleLinks(`/tin-tuc/${item.slug}`),
    });

    applyNewsStructuredData(item);
  } else {
    updateSeoMeta({
      title: t('seo.newsNotFound.title'),
      description: t('seo.newsNotFound.description'),
      keywords: t('seo.newsNotFound.keywords'),
      canonical: buildLocalizedCanonicalUrl('/tin-tuc', locale.value),
      robots: 'noindex, follow',
      locale: locale.value,
      alternates: buildAlternateLocaleLinks('/tin-tuc'),
    });

    clearNewsStructuredData();
  }
};

watch(
  () => [route.params.slug, locale.value],
  async () => {
    await loadNewsDetail();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearNewsStructuredData();
  newsStore.clearNewsDetail();
});

const onImageError = (event) => {
  event.target.src = appConfig.fallbackImage;
};
</script>
