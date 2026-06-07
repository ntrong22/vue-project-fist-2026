import { registerDirectives } from '@/plugins/directives';

export default defineNuxtPlugin((nuxtApp) => {
  registerDirectives(nuxtApp.vueApp);
});
