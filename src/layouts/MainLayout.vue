<template>
  <div class="min-h-screen bg-slate-50">
    <div
      v-if="appStore.authExpired"
      class="border-b border-amber-300 bg-amber-50"
      role="status"
      aria-live="polite"
    >
      <div class="container-wide flex items-center justify-between gap-3 py-2 text-sm text-amber-900">
        <p>{{ t('auth.expiredMessage') }}</p>
        <button
          type="button"
          class="rounded-md border border-amber-400 px-2 py-1 text-xs font-medium hover:bg-amber-100"
          @click="appStore.markAuthExpired(false)"
        >
          {{ t('common.close') }}
        </button>
      </div>
    </div>

    <AppHeader />
    <main class="pb-8">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import AppFooter from '@/components/layout/AppFooter.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import { addUnauthorizedListener } from '@/services/authSession';
import { useAppStore } from '@/stores/useAppStore';
import { buildCanonicalUrl, removeStructuredData, setStructuredData } from '@/utils/seoHelper';

const appStore = useAppStore();
const { t } = useI18n({ useScope: 'global' });

let removeUnauthorizedListener = () => {};

const applyWebsiteStructuredData = () => {
  // Khai báo schema WebSite 1 lần ở layout để công cụ tìm kiếm hiểu rõ website và chức năng tìm kiếm.
  setStructuredData('website', {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: appStore.appName,
    url: buildCanonicalUrl('/'),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${buildCanonicalUrl('/tim-kiem')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  });
};

applyWebsiteStructuredData();

onMounted(() => {
  removeUnauthorizedListener = addUnauthorizedListener(() => {
    appStore.markAuthExpired(true);
    appStore.setAuthenticated(false);
  });
});

onBeforeUnmount(() => {
  removeStructuredData('website');
  removeUnauthorizedListener();
});
</script>
