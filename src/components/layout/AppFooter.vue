<template>
  <footer class="border-t border-slate-200 bg-white">
    <div class="container-wide py-10">
      <div class="grid gap-8 md:grid-cols-3">
        <section>
          <h2 class="mb-3 text-lg font-bold text-slate-900">{{ t('app.name') }}</h2>
          <p class="text-sm leading-6 text-slate-600">
            {{ t('footer.description') }}
          </p>
        </section>

        <section>
          <h3 class="mb-3 text-base font-semibold text-slate-900">{{ t('footer.categoryTitle') }}</h3>
          <ul class="space-y-2 text-sm text-slate-600">
            <li v-for="item in categoriesToShow" :key="item.id">
              <NuxtLink :to="`/danh-muc/${item.slug}`" class="hover:text-brand-700">
                {{ getCategoryName(item) }}
              </NuxtLink>
            </li>
          </ul>
        </section>

        <section>
          <h3 class="mb-3 text-base font-semibold text-slate-900">{{ t('footer.contactTitle') }}</h3>
          <ul class="space-y-2 text-sm text-slate-600">
            <li>{{ t('contactPage.email') }}</li>
            <li>{{ t('contactPage.hotline') }}</li>
            <li>{{ t('contactPage.address') }}</li>
          </ul>
        </section>
      </div>

      <p class="mt-8 border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
        {{ t('footer.copyright', { year }) }}
      </p>
    </div>
  </footer>
</template>

<script setup>
import { computed, onMounted, onServerPrefetch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocale } from '@/composables/useLocale';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { getLocalizedContent } from '@/utils/localizedContent';

const year = new Date().getFullYear();
const { t } = useI18n({ useScope: 'global' });
const { locale } = useLocale();
const categoryStore = useCategoryStore();

const categoriesToShow = computed(() => categoryStore.categories.slice(0, 6));

const getCategoryName = (category) => getLocalizedContent(category, 'name', locale.value);

const loadFooterCategories = async () => {
  if (!categoryStore.hasCategories) {
    await categoryStore.fetchCategories();
  }
};

onServerPrefetch(loadFooterCategories);

onMounted(loadFooterCategories);
</script>
