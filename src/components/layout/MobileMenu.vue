<template>
  <Transition name="fade">
    <div v-if="open" class="fixed inset-0 z-40 bg-slate-900/40" @click="emit('close')" />
  </Transition>

  <Transition name="slide">
    <aside
      v-if="open"
      class="fixed left-0 top-0 z-50 h-full w-80 max-w-[88%] overflow-y-auto bg-white p-5 shadow-2xl"
      :aria-label="t('mobileMenu.ariaLabel')"
    >
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900">{{ t('nav.categories') }}</h2>
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
          @click="emit('close')"
        >
          {{ t('common.close') }}
        </button>
      </div>

      <div class="mb-4">
        <LanguageSwitcher />
      </div>

      <nav class="space-y-1">
        <RouterLink
          to="/"
          class="block rounded-lg px-3 py-2 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
          @click="emit('close')"
        >
          {{ t('nav.home') }}
        </RouterLink>
        <RouterLink
          to="/tin-tuc"
          class="block rounded-lg px-3 py-2 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
          @click="emit('close')"
        >
          {{ t('nav.latest') }}
        </RouterLink>
        <RouterLink
          v-for="item in categories"
          :key="item.id"
          :to="`/danh-muc/${item.slug}`"
          class="block rounded-lg px-3 py-2 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
          @click="emit('close')"
        >
          {{ getCategoryName(item) }}
        </RouterLink>
        <RouterLink
          to="/gioi-thieu"
          class="block rounded-lg px-3 py-2 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
          @click="emit('close')"
        >
          {{ t('nav.about') }}
        </RouterLink>
        <RouterLink
          to="/lien-he"
          class="block rounded-lg px-3 py-2 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
          @click="emit('close')"
        >
          {{ t('nav.contact') }}
        </RouterLink>
      </nav>
    </aside>
  </Transition>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue';
import { useLocale } from '@/composables/useLocale';
import { getLocalizedContent } from '@/utils/localizedContent';

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close']);
const { t } = useI18n({ useScope: 'global' });
const { locale } = useLocale();

const getCategoryName = (category) => getLocalizedContent(category, 'name', locale.value);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
