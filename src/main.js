import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import '@/styles/main.css';
import {
  buildAlternateLocaleLinks,
  buildLocalizedCanonicalUrl,
  setDefaultSeoMeta,
} from '@/utils/seoHelper';
import i18n from '@/plugins/i18n';
import { registerDirectives } from '@/plugins/directives';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
registerDirectives(app);

const initialLocale = i18n.global.locale.value;
setDefaultSeoMeta({
  title: i18n.global.t('seo.default.title'),
  description: i18n.global.t('seo.default.description'),
  keywords: i18n.global.t('seo.default.keywords'),
  canonical: buildLocalizedCanonicalUrl('/', initialLocale),
  locale: initialLocale,
  alternates: buildAlternateLocaleLinks('/'),
});
app.mount('#app');
