<template>
  <MainLayout>
    <NuxtPage />
  </MainLayout>
</template>

<script setup>
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import MainLayout from '@/layouts/MainLayout.vue';
import {
  buildAlternateLocaleLinks,
  buildLocalizedCanonicalUrl,
  setDefaultSeoMeta,
} from '@/utils/seoHelper';

const { t, locale } = useI18n({ useScope: 'global' });

const applyDefaultSeo = () => {
  setDefaultSeoMeta({
    title: t('seo.default.title'),
    description: t('seo.default.description'),
    keywords: t('seo.default.keywords'),
    canonical: buildLocalizedCanonicalUrl('/', locale.value),
    locale: locale.value,
    alternates: buildAlternateLocaleLinks('/'),
  });
};

applyDefaultSeo();

watch(
  () => locale.value,
  () => applyDefaultSeo(),
);
</script>
