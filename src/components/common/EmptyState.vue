<template>
  <div class="card-surface p-8 text-center">
    <h3 class="mb-2 text-lg font-semibold text-slate-900">{{ resolvedTitle }}</h3>
    <p class="mx-auto max-w-xl text-slate-600">{{ resolvedDescription }}</p>
    <div v-if="$slots.action" class="mt-5">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: 'global' });

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
});

const resolvedTitle = computed(() => props.title || t('common.emptyTitle'));
const resolvedDescription = computed(() => props.description || t('common.emptyDescription'));
</script>
