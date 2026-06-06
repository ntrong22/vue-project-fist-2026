<template>
  <section class="container-wide pt-6">
    <Breadcrumb :items="[{ label: t('contactPage.breadcrumb') }]" />

    <article class="card-surface p-6 lg:p-8">
      <h1 class="mb-3 text-3xl font-bold text-slate-900">{{ t('contactPage.title') }}</h1>
      <p class="mb-6 text-slate-600">
        {{ t('contactPage.intro') }}
      </p>

      <div class="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 class="mb-3 text-xl font-semibold text-slate-900">{{ t('contactPage.officeTitle') }}</h2>
          <ul class="space-y-2 text-slate-600">
            <li>{{ t('contactPage.address') }}</li>
            <li>{{ t('contactPage.email') }}</li>
            <li>{{ t('contactPage.hotline') }}</li>
            <li>{{ t('contactPage.workTime') }}</li>
          </ul>
          
        </section>
 
        <section>
          <h2 class="mb-3 text-xl font-semibold text-slate-900">{{ t('contactPage.quickFormTitle') }}</h2>
          <form class="space-y-3" @submit.prevent>
            <label class="block">
              <span class="mb-1 block text-sm text-slate-700">{{ t('contactPage.fullNameLabel') }}</span>
              <input type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500" />
            </label>
            <label class="block">
              <span class="mb-1 block text-sm text-slate-700">{{ t('contactPage.emailLabel') }}</span>
              <input type="email" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500" />
            </label>
            <label class="block">
              <span class="mb-1 block text-sm text-slate-700">{{ t('contactPage.contentLabel') }}</span>
              <textarea rows="4" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500" />
            </label>
            <button type="submit" class="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">
              {{ t('contactPage.submit') }}
            </button>
          </form>
        </section>
      </div>
    </article>
  </section>
</template>

<script setup>
import { onMounted, watch } from 'vue';
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
    title: t('seo.contact.title'),
    description: t('seo.contact.description'),
    keywords: t('seo.contact.keywords'),
    canonical: buildLocalizedCanonicalUrl('/lien-he', locale.value),
    locale: locale.value,
    alternates: buildAlternateLocaleLinks('/lien-he'),
  });
};

onMounted(() => {
  applySeo();
});

watch(
  () => locale.value,
  () => applySeo(),
);
</script>
