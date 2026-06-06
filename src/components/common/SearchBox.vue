<template>
  <form class="flex w-full items-center gap-2" role="search" @submit.prevent="onSubmit">
    <label class="sr-only" :for="inputId">{{ t('nav.search') }}</label>
    <input
      :id="inputId"
      v-model="keyword"
      type="search"
      maxlength="120"
      class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
      :placeholder="resolvedPlaceholder"
      autocomplete="off"
      spellcheck="false"
    />
    <button
      type="submit"
      class="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
    >
      {{ t('common.search') }}
    </button>
  </form>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { normalizeSearchInput } from '@/utils/sanitizeHtml';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  inputId: {
    type: String,
    default: 'search-box',
  },
});

const emit = defineEmits(['update:modelValue', 'search']);
const { t } = useI18n({ useScope: 'global' });

const keyword = ref(normalizeSearchInput(props.modelValue));
const resolvedPlaceholder = computed(() => props.placeholder || t('common.searchPlaceholder'));

watch(
  () => props.modelValue,
  (nextValue) => {
    keyword.value = normalizeSearchInput(nextValue);
  },
);

watch(keyword, (nextValue) => {
  const normalized = normalizeSearchInput(nextValue);

  if (normalized !== nextValue) {
    keyword.value = normalized;
    return;
  }

  emit('update:modelValue', normalized);
});

const onSubmit = () => {
  const safeQuery = normalizeSearchInput(keyword.value);
  keyword.value = safeQuery;
  emit('update:modelValue', safeQuery);
  emit('search', safeQuery);
};
</script>
