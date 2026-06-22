import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { ref, computed, onServerPrefetch, watch, mergeProps, unref, useSSRContext } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { _ as _sfc_main$2 } from './Breadcrumb-DcrKZ2Ot.mjs';
import { u as useNewsStore, _ as _sfc_main$3, a as _sfc_main$1$1, b as _sfc_main$2$1 } from './useNewsStore-DMAV_6AT.mjs';
import { _ as _sfc_main$4 } from './Pagination-DMNsGDjT.mjs';
import { n as normalizeSearchInput, f as buildAlternateLocaleLinks, e as buildLocalizedCanonicalUrl, h as useSeoHead, k as _sfc_main$7 } from './server.mjs';
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

const useDebounce = (callback, delay = 300) => {
  let timerId = null;
  const run = (...args) => {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
  const cancel = () => {
    if (!timerId) {
      return;
    }
    clearTimeout(timerId);
    timerId = null;
  };
  return {
    run,
    cancel
  };
};
const _sfc_main$1 = {
  __name: "SearchView",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const newsStore = useNewsStore();
    const { t, locale } = useI18n({ useScope: "global" });
    const searchKeyword = ref("");
    const searchResult = computed(() => newsStore.searchResult);
    const isLoading = computed(() => newsStore.loading.search);
    const errorMessage = computed(() => newsStore.error.search);
    const pageFromQuery = computed(() => {
      const value = Number(route.query.page || 1);
      return Number.isNaN(value) || value < 1 ? 1 : value;
    });
    const safeSearchQuery = computed(() => {
      const rawQuery = route.query.q ? String(route.query.q) : "";
      return normalizeSearchInput(rawQuery);
    });
    const searchSeoMeta = computed(() => {
      const title = safeSearchQuery.value ? t("seo.search.titleWithKeyword", { keyword: safeSearchQuery.value }) : t("seo.search.title");
      const description = safeSearchQuery.value ? t("seo.search.descriptionWithKeyword", { keyword: safeSearchQuery.value }) : t("seo.search.description");
      return {
        title,
        description,
        keywords: safeSearchQuery.value ? t("seo.search.keywordsWithKeyword", { keyword: safeSearchQuery.value }) : t("seo.search.keywords"),
        canonical: buildLocalizedCanonicalUrl("/tim-kiem", locale.value),
        robots: "noindex, follow",
        locale: locale.value,
        alternates: buildAlternateLocaleLinks("/tim-kiem")
      };
    });
    useSeoHead(searchSeoMeta);
    const { run: runSearchDebounce, cancel: cancelSearchDebounce } = useDebounce((value) => {
      const safeQuery = normalizeSearchInput(value);
      const currentRouteQuery = route.query.q ? String(route.query.q) : "";
      if (safeQuery === currentRouteQuery) {
        return;
      }
      router.push({
        path: "/tim-kiem",
        query: safeQuery ? { q: safeQuery } : {}
      });
    }, 450);
    const loadSearch = async () => {
      const safeQuery = safeSearchQuery.value;
      searchKeyword.value = safeQuery;
      await newsStore.searchNews(safeQuery, pageFromQuery.value);
    };
    const handleSearch = (keyword) => {
      cancelSearchDebounce();
      const safeQuery = normalizeSearchInput(keyword);
      router.push({
        path: "/tim-kiem",
        query: safeQuery ? { q: safeQuery } : {}
      });
    };
    const handlePageChange = (nextPage) => {
      const currentQuery = searchResult.value.query;
      router.push({
        path: "/tim-kiem",
        query: {
          ...currentQuery ? { q: currentQuery } : {},
          ...nextPage > 1 ? { page: String(nextPage) } : {}
        }
      });
    };
    onServerPrefetch(loadSearch);
    watch(
      () => [route.query.q, route.query.page, locale.value],
      async () => {
        await loadSearch();
      }
    );
    watch(searchKeyword, (nextKeyword) => {
      runSearchDebounce(nextKeyword);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "container-wide pt-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$2, {
        items: [{ label: unref(t)("searchPage.breadcrumb") }]
      }, null, _parent));
      _push(`<div class="mb-6 card-surface p-4 sm:p-5">`);
      _push(ssrRenderComponent(_sfc_main$7, {
        modelValue: searchKeyword.value,
        "onUpdate:modelValue": ($event) => searchKeyword.value = $event,
        "input-id": "search-page-input",
        placeholder: unref(t)("searchPage.placeholder"),
        onSearch: handleSearch
      }, null, _parent));
      _push(`</div><h1 class="mb-4 text-3xl font-bold text-slate-900">${ssrInterpolate(unref(t)("searchPage.title"))}</h1>`);
      if (searchResult.value.query) {
        _push(`<p class="mb-5 text-sm text-slate-600">${ssrInterpolate(unref(t)("searchPage.keywordLabel", { keyword: searchResult.value.query, count: searchResult.value.pagination.totalItems }))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (isLoading.value) {
        _push(ssrRenderComponent(_sfc_main$3, {
          count: 6,
          type: "card"
        }, null, _parent));
      } else if (errorMessage.value) {
        _push(ssrRenderComponent(_sfc_main$1$1, {
          title: unref(t)("searchPage.loadErrorTitle"),
          description: errorMessage.value
        }, null, _parent));
      } else if (!searchResult.value.query) {
        _push(ssrRenderComponent(_sfc_main$1$1, {
          title: unref(t)("searchPage.emptyKeywordTitle"),
          description: unref(t)("searchPage.emptyKeywordDescription")
        }, null, _parent));
      } else if (!searchResult.value.items.length) {
        _push(ssrRenderComponent(_sfc_main$1$1, {
          title: unref(t)("searchPage.emptyResultTitle"),
          description: unref(t)("searchPage.emptyResultDescription")
        }, null, _parent));
      } else {
        _push(`<!--[--><div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><!--[-->`);
        ssrRenderList(searchResult.value.items, (item) => {
          _push(ssrRenderComponent(_sfc_main$2$1, {
            key: item.id,
            item
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
        _push(ssrRenderComponent(_sfc_main$4, {
          page: searchResult.value.pagination.page,
          "total-pages": searchResult.value.pagination.totalPages,
          onChange: handlePageChange
        }, null, _parent));
        _push(`<!--]-->`);
      }
      _push(`</section>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/SearchView.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "tim-kiem",
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/tim-kiem.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=tim-kiem-DY2drvw5.mjs.map
