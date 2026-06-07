<template>
  <section class="container-wide pt-10">
    <article class="card-surface p-8 text-center lg:p-12">
      <p class="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-700">404</p>
      <h1 class="mb-3 text-3xl font-bold text-slate-900">{{ t('notFoundPage.title') }}</h1>
      <p class="mx-auto mb-6 max-w-xl text-slate-600">
        {{ t('notFoundPage.description') }}
      </p>
      <NuxtLink
        to="/"
        class="inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        {{ t('common.goHome') }}
      </NuxtLink>
    </article>
  </section>
</template>

<script setup>
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  buildAlternateLocaleLinks,
  buildLocalizedCanonicalUrl,
  updateSeoMeta,
} from '@/utils/seoHelper';

const { t, locale } = useI18n({ useScope: 'global' });

const applySeo = () => {
  updateSeoMeta({
    title: t('seo.notFound.title'),
    description: t('seo.notFound.description'),
    keywords: t('seo.notFound.keywords'),
    canonical: buildLocalizedCanonicalUrl('/404', locale.value),
    robots: 'noindex, nofollow',
    locale: locale.value,
    alternates: buildAlternateLocaleLinks('/404'),
  });
};

applySeo();

watch(
  () => locale.value,
  () => applySeo(),
);
</script>
