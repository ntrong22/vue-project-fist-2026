<template>
  <section class="container-wide pt-6">
    <Breadcrumb :items="[{ label: t('aboutPage.breadcrumb') }]" />

    <article class="card-surface p-6 lg:p-8">
      <header class="mb-6">
        <h1 class="mb-3 text-3xl font-bold text-slate-900">{{ t('aboutPage.title') }}</h1>
        <p class="max-w-3xl text-slate-600">
          {{ t('aboutPage.intro') }}
        </p>
      </header>

      <div class="grid gap-6 md:grid-cols-2">
        <section>
          <h2 class="mb-2 text-xl font-semibold text-slate-900">{{ t('aboutPage.missionTitle') }}</h2>
          <p class="text-slate-600">
            {{ t('aboutPage.missionText') }}
          </p>
        </section>

        <section>
          <h2 class="mb-2 text-xl font-semibold text-slate-900">{{ t('aboutPage.valuesTitle') }}</h2>
          <ul class="list-disc space-y-1 pl-6 text-slate-600">
            <li>{{ t('aboutPage.value1') }}</li>
            <li>{{ t('aboutPage.value2') }}</li>
            <li>{{ t('aboutPage.value3') }}</li>
          </ul>
        </section>
      </div>
    </article>
  </section>
</template>

<script setup>
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Breadcrumb from '@/components/common/Breadcrumb.vue';
import {
  buildAlternateLocaleLinks,
  buildLocalizedCanonicalUrl,
  updateSeoMeta,
} from '@/utils/seoHelper';

const { t, locale } = useI18n({ useScope: 'global' });

const applySeo = () => {
  updateSeoMeta({
    title: t('seo.about.title'),
    description: t('seo.about.description'),
    keywords: t('seo.about.keywords'),
    canonical: buildLocalizedCanonicalUrl('/gioi-thieu', locale.value),
    locale: locale.value,
    alternates: buildAlternateLocaleLinks('/gioi-thieu'),
  });
};

applySeo();

watch(
  () => locale.value,
  () => applySeo(),
);
</script>
