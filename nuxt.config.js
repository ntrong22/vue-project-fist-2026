import { fileURLToPath, URL } from 'node:url';
import categories from './src/data/categories.js';
import news from './src/data/news.js';

const appName = process.env.VITE_APP_NAME || 'VietNews 24h';
const appUrl = (process.env.VITE_APP_URL || 'https://example.com').replace(/\/$/, '');

const supportedLocales = ['vi', 'en'];
const defaultLocale = 'vi';

const withLocales = (path) => {
  return supportedLocales.map((locale) => {
    return locale === defaultLocale ? path : `${path}?lang=${locale}`;
  });
};

const buildPrerenderRoutes = () => {
  const routes = new Set([
    ...withLocales('/'),
    ...withLocales('/tin-tuc'),
    ...withLocales('/gioi-thieu'),
    ...withLocales('/lien-he'),
    '/sitemap.xml',
    '/news-sitemap.xml',
    '/robots.txt',
  ]);

  categories.forEach((item) => {
    if (item?.slug) {
      withLocales(`/danh-muc/${item.slug}`).forEach((route) => routes.add(route));
    }
  });

  news.forEach((item) => {
    if (item?.slug) {
      withLocales(`/tin-tuc/${item.slug}`).forEach((route) => routes.add(route));
    }
  });

  return [...routes];
};

export default defineNuxtConfig({
  ssr: true,
  debug: false,
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: false,
  },

  experimental: {
    appManifest: false,
  },

  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
  },

  modules: ['@pinia/nuxt'],

  css: ['@/styles/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: defaultLocale,
      },
      title: `${appName} - Tin tức mới nhất mỗi ngày`,
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Trang tin tức tổng hợp cập nhật nhanh, chuẩn SEO, giao diện hiện đại và tối ưu trải nghiệm người dùng.',
        },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: appName },
        { property: 'og:locale', content: 'vi_VN' },
        { property: 'og:title', content: appName },
        { property: 'og:description', content: 'Nền tảng tin tức hiện đại, cập nhật liên tục nhiều chuyên mục.' },
        { property: 'og:url', content: `${appUrl}/` },
        { property: 'og:image', content: `${appUrl}/images/og-default.svg` },
        { property: 'og:image:alt', content: appName },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: appName },
        { name: 'twitter:description', content: 'Nền tảng tin tức hiện đại, cập nhật liên tục nhiều chuyên mục.' },
        { name: 'twitter:image', content: `${appUrl}/images/og-default.svg` },
      ],
      link: [
        { rel: 'canonical', href: `${appUrl}/` },
        { rel: 'alternate', hreflang: 'vi-VN', href: `${appUrl}/` },
        { rel: 'alternate', hreflang: 'en-US', href: `${appUrl}/?lang=en` },
        { rel: 'alternate', hreflang: 'x-default', href: `${appUrl}/` },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      appName,
      appUrl,
      apiBaseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
      useMockApi: process.env.VITE_USE_MOCK_API || 'true',
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: buildPrerenderRoutes(),
    },
  },

  routeRules: {
    '/': { prerender: true },
    '/tin-tuc': { prerender: true },
    '/tin-tuc/**': { prerender: true },
    '/danh-muc/**': { prerender: true },
    '/gioi-thieu': { prerender: true },
    '/lien-he': { prerender: true },
    '/tim-kiem': { prerender: false },
    '/404': { prerender: false },
  },
});
