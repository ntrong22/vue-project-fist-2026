<template>
  <NotFoundView />
</template>

<script setup>
import NotFoundView from '@/pages/NotFoundView.vue';

setResponseStatus(404);
</script>
