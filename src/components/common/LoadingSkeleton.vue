<template>
  <div>
    <div v-if="type === 'card'" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="item in count" :key="item" class="card-surface overflow-hidden">
        <div class="h-44 animate-pulse bg-slate-200" />
        <div class="space-y-3 p-4">
          <div class="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
          <div class="h-5 w-full animate-pulse rounded bg-slate-200" />
          <div class="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
          <div class="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div v-for="item in count" :key="item" class="card-surface p-4">
        <div class="mb-3 h-5 w-2/3 animate-pulse rounded bg-slate-200" />
        <div class="h-4 w-full animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 6,
  },
  type: {
    type: String,
    default: 'card',
  },
});
</script>
