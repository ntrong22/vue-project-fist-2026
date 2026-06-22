import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { computed, onServerPrefetch, watch, mergeProps, unref, useSSRContext } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { _ as _sfc_main$2 } from './Breadcrumb-DcrKZ2Ot.mjs';
import { u as useNewsStore, _ as _sfc_main$3, a as _sfc_main$1$1, b as _sfc_main$2$1 } from './useNewsStore-DMAV_6AT.mjs';
import { _ as _sfc_main$4 } from './Pagination-DMNsGDjT.mjs';
import { _ as _sfc_main$5 } from './SidebarNews-BaOZfwvv.mjs';
import { e as buildLocalizedCanonicalUrl, f as buildAlternateLocaleLinks, b as buildNewsPath, g as getLocalizedContent, h as useSeoHead, i as useStructuredDataHead } from './server.mjs';
import 'pinia';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'isomorphic-dompurify';
import 'axios';

const _sfc_main$1 = {
  __name: "NewsListView",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const newsStore = useNewsStore();
    const { t, locale } = useI18n({ useScope: "global" });
    const newsList = computed(() => newsStore.newsList);
    const isLoading = computed(() => newsStore.loading.list);
    const errorMessage = computed(() => newsStore.error.list);
    const pageFromQuery = computed(() => {
      const value = Number(route.query.page || 1);
      return Number.isNaN(value) || value < 1 ? 1 : value;
    });
    const canonicalQuery = computed(() => pageFromQuery.value > 1 ? { page: pageFromQuery.value } : {});
    const newsListCanonicalUrl = computed(
      () => buildLocalizedCanonicalUrl("/tin-tuc", locale.value, canonicalQuery.value)
    );
    const newsListSeoMeta = computed(() => ({
      title: t("seo.newsList.title"),
      description: t("seo.newsList.description"),
      keywords: t("seo.newsList.keywords"),
      canonical: newsListCanonicalUrl.value,
      robots: "index, follow, max-image-preview:large",
      locale: locale.value,
      alternates: buildAlternateLocaleLinks("/tin-tuc", canonicalQuery.value)
    }));
    const newsListStructuredDataEntries = computed(() => {
      const items = newsList.value.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: getLocalizedContent(item, "title", locale.value),
        url: buildLocalizedCanonicalUrl(buildNewsPath(item.slug), locale.value)
      }));
      return [
        {
          id: "news-list-breadcrumb",
          schema: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: t("nav.home"),
                item: buildLocalizedCanonicalUrl("/", locale.value)
              },
              {
                "@type": "ListItem",
                position: 2,
                name: t("news.latest"),
                item: newsListCanonicalUrl.value
              }
            ]
          }
        },
        {
          id: "news-list-collection",
          schema: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: t("seo.newsList.title"),
            description: t("seo.newsList.description"),
            url: newsListCanonicalUrl.value,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: items.length,
              itemListElement: items
            }
          }
        }
      ];
    });
    useSeoHead(newsListSeoMeta);
    useStructuredDataHead(newsListStructuredDataEntries);
    const loadNewsList = async () => {
      await newsStore.fetchNewsList(pageFromQuery.value);
    };
    const handlePageChange = (nextPage) => {
      router.push({
        path: "/tin-tuc",
        query: nextPage > 1 ? { page: String(nextPage) } : {}
      });
    };
    onServerPrefetch(loadNewsList);
    watch(
      () => [route.query.page, locale.value],
      async () => {
        await loadNewsList();
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "container-wide pt-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$2, {
        items: [{ label: unref(t)("news.latest") }]
      }, null, _parent));
      _push(`<div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_340px]"><div><h1 class="mb-2 text-3xl font-bold text-slate-900">${ssrInterpolate(unref(t)("news.latestPageTitle"))}</h1><p class="mb-5 text-sm text-slate-600">${ssrInterpolate(unref(t)("news.latestCount", { count: newsList.value.pagination.totalItems }))}</p>`);
      if (isLoading.value) {
        _push(ssrRenderComponent(_sfc_main$3, {
          count: 6,
          type: "card"
        }, null, _parent));
      } else if (errorMessage.value) {
        _push(ssrRenderComponent(_sfc_main$1$1, {
          title: unref(t)("news.listLoadError"),
          description: errorMessage.value
        }, null, _parent));
      } else if (!newsList.value.items.length) {
        _push(ssrRenderComponent(_sfc_main$1$1, {
          title: unref(t)("news.listEmptyTitle"),
          description: unref(t)("news.listEmptyDescription")
        }, null, _parent));
      } else {
        _push(`<!--[--><div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><!--[-->`);
        ssrRenderList(newsList.value.items, (item) => {
          _push(ssrRenderComponent(_sfc_main$2$1, {
            key: item.id,
            item
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
        _push(ssrRenderComponent(_sfc_main$4, {
          page: newsList.value.pagination.page,
          "total-pages": newsList.value.pagination.totalPages,
          onChange: handlePageChange
        }, null, _parent));
        _push(`<!--]-->`);
      }
      _push(`</div><aside class="space-y-5">`);
      _push(ssrRenderComponent(_sfc_main$5, {
        title: unref(t)("home.topReads"),
        items: newsList.value.sidebarItems
      }, null, _parent));
      _push(`</aside></div></section>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/NewsListView.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$1, _attrs, null, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/tin-tuc/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BD2vF-iQ.mjs.map
