<template>
  <nav v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
    <button
      type="button"
      class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-400 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="page <= 1"
      @click="goToPage(page - 1)"
    >
      {{ t('common.previous') }}
    </button>

    <button
      v-for="item in visiblePages"
      :key="`page-${item}`"
      type="button"
      :disabled="item === '...'"
      class="min-w-10 rounded-lg border px-3 py-2 text-sm transition"
      :class="[
        item === page
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-slate-300 text-slate-700 hover:border-brand-400 hover:text-brand-700',
        item === '...' ? 'cursor-default border-transparent text-slate-400 hover:border-transparent hover:text-slate-400' : '',
      ]"
      @click="item !== '...' && goToPage(item)"
    >
      {{ item }}
    </button>

    <button
      type="button"
      class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-400 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="page >= totalPages"
      @click="goToPage(page + 1)"
    >
      {{ t('common.next') }}
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  page: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
  maxVisible: {
    type: Number,
    default: 7,
  },
});

const emit = defineEmits(['update:page', 'change']);
const { t } = useI18n({ useScope: 'global' });

const visiblePages = computed(() => {
  if (props.totalPages <= props.maxVisible) {
    return Array.from({ length: props.totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  const side = 2;
  const start = Math.max(2, props.page - side);
  const end = Math.min(props.totalPages - 1, props.page + side);

  if (start > 2) {
    pages.push('...');
  }

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  if (end < props.totalPages - 1) {
    pages.push('...');
  }

  pages.push(props.totalPages);

  return pages;
});

const goToPage = (nextPage) => {
  if (nextPage < 1 || nextPage > props.totalPages || nextPage === props.page) {
    return;
  }

  emit('update:page', nextPage);
  emit('change', nextPage);
};
</script>
