<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div class="container-wide">
      <div class="flex items-center justify-between gap-4 py-3">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 lg:hidden"
            @click="appStore.toggleMobileMenu()"
            :aria-label="t('header.menuAria')"
          >
            <span class="text-xl leading-none">☰</span>
          </button>

          <RouterLink to="/" class="flex items-center gap-2">
            <span class="rounded-lg bg-brand-600 px-2.5 py-1 text-sm font-bold text-white">VN</span>
            <span class="text-lg font-bold text-slate-900">{{ appStore.appName }}</span>
          </RouterLink>
        </div>

        <div class="hidden min-w-0 flex-1 lg:block">
          <SearchBox
            v-model="searchKeyword"
            input-id="header-search"
            :placeholder="t('header.searchPlaceholder')"
            @search="handleSearch"
          />
        </div>

        <div class="hidden lg:block">
          <LanguageSwitcher />
        </div>

        <RouterLink
          to="/tim-kiem"
          class="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-400 hover:text-brand-700 lg:hidden"
        >
          {{ t('nav.search') }}
        </RouterLink>
      </div>

      <nav class="hidden items-center gap-1 overflow-x-auto whitespace-nowrap border-t border-slate-100 py-2 lg:flex">
        <RouterLink
          to="/"
          class="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
          active-class="bg-brand-600 text-white hover:bg-brand-600 hover:text-white"
        >
          {{ t('nav.home') }}
        </RouterLink>

        <RouterLink
          to="/tin-tuc"
          class="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
          active-class="bg-brand-600 text-white hover:bg-brand-600 hover:text-white"
        >
          {{ t('nav.latest') }}
        </RouterLink>

        <RouterLink
          v-for="item in categories"
          :key="item.id"
          :to="`/danh-muc/${item.slug}`"
          class="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
          active-class="bg-brand-600 text-white hover:bg-brand-600 hover:text-white"
        >
          {{ getCategoryName(item) }}
        </RouterLink>

        <RouterLink
          to="/gioi-thieu"
          class="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
          active-class="bg-brand-600 text-white hover:bg-brand-600 hover:text-white"
        >
          {{ t('nav.about') }}
        </RouterLink>

        <RouterLink
          to="/lien-he"
          class="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
          active-class="bg-brand-600 text-white hover:bg-brand-600 hover:text-white"
        >
          {{ t('nav.contact') }}
        </RouterLink>
      </nav>
    </div>

    <MobileMenu
      :open="appStore.isMobileMenuOpen"
      :categories="categories"
      @close="appStore.setMobileMenu(false)"
    />
  </header>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import SearchBox from '@/components/common/SearchBox.vue';
import MobileMenu from '@/components/layout/MobileMenu.vue';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue';
import { useLocale } from '@/composables/useLocale';
import { useAppStore } from '@/stores/useAppStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { getLocalizedContent } from '@/utils/localizedContent';
import { normalizeSearchInput } from '@/utils/sanitizeHtml';

const appStore = useAppStore();
const categoryStore = useCategoryStore();
const route = useRoute();
const router = useRouter();
const { t } = useI18n({ useScope: 'global' });
const { locale } = useLocale();

const categories = computed(() => categoryStore.categories);
const searchKeyword = ref('');

watch(
  () => locale.value,
  (nextLocale) => {
    appStore.setLocale(nextLocale);
  },
  { immediate: true },
);

watch(
  () => route.query.q,
  (value) => {
    searchKeyword.value = value ? normalizeSearchInput(String(value)) : '';
  },
  { immediate: true },
);

onMounted(async () => {
  if (!categoryStore.hasCategories) {
    await categoryStore.fetchCategories();
  }
});

const handleSearch = (value) => {
  const safeQuery = normalizeSearchInput(value);

  router.push({
    name: 'search',
    query: safeQuery ? { q: safeQuery } : {},
  });

  appStore.setMobileMenu(false);
};

const getCategoryName = (category) => getLocalizedContent(category, 'name', locale.value);
</script>
