import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { computed, onServerPrefetch, watch, mergeProps, unref, useSSRContext } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { _ as _sfc_main$2 } from './Breadcrumb-DcrKZ2Ot.mjs';
import { u as useNewsStore, _ as _sfc_main$3, a as _sfc_main$1$1, b as _sfc_main$2$1 } from './useNewsStore-DMAV_6AT.mjs';
import { _ as _sfc_main$4 } from './Pagination-DMNsGDjT.mjs';
import { _ as _sfc_main$5 } from './SidebarNews-BaOZfwvv.mjs';
import { g as getLocalizedContent, e as buildLocalizedCanonicalUrl, f as buildAlternateLocaleLinks, b as buildNewsPath, h as useSeoHead, i as useStructuredDataHead } from './server.mjs';
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
  __name: "CategoryView",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const newsStore = useNewsStore();
    const { t, locale } = useI18n({ useScope: "global" });
    const categoryNews = computed(() => newsStore.categoryNews);
    const isLoading = computed(() => newsStore.loading.category);
    const errorMessage = computed(() => newsStore.error.category);
    const pageFromQuery = computed(() => {
      const value = Number(route.query.page || 1);
      return Number.isNaN(value) || value < 1 ? 1 : value;
    });
    const pageTitle = computed(() => {
      const categoryName = getLocalizedContent(categoryNews.value.category, "name", locale.value);
      return categoryNews.value.category ? t("categoryPage.titlePrefix", { name: categoryName }) : t("categoryPage.defaultTitle");
    });
    const breadcrumbItems = computed(() => {
      if (categoryNews.value.category) {
        return [{ label: getLocalizedContent(categoryNews.value.category, "name", locale.value) }];
      }
      return [{ label: t("common.category") }];
    });
    const canonicalQuery = computed(() => pageFromQuery.value > 1 ? { page: pageFromQuery.value } : {});
    const categoryCanonicalUrl = computed(() => {
      var _a;
      const slug = ((_a = categoryNews.value.category) == null ? void 0 : _a.slug) || String(route.params.slug || "");
      const path = slug ? `/danh-muc/${slug}` : "/danh-muc";
      return buildLocalizedCanonicalUrl(path, locale.value, canonicalQuery.value);
    });
    const categorySeoMeta = computed(() => {
      if (categoryNews.value.category) {
        const category = categoryNews.value.category;
        const categoryName = getLocalizedContent(category, "name", locale.value);
        const categoryDescription = getLocalizedContent(category, "description", locale.value);
        return {
          title: `${categoryName} - VietNews 24h`,
          description: categoryDescription,
          keywords: `${categoryName}, vietnews 24h`,
          canonical: categoryCanonicalUrl.value,
          robots: "index, follow, max-image-preview:large",
          locale: locale.value,
          alternates: buildAlternateLocaleLinks(`/danh-muc/${category.slug}`, canonicalQuery.value)
        };
      }
      return {
        title: t("seo.categoryNotFound.title"),
        description: t("seo.categoryNotFound.description"),
        keywords: t("seo.categoryNotFound.keywords"),
        canonical: buildLocalizedCanonicalUrl("/danh-muc", locale.value),
        robots: "noindex, follow",
        locale: locale.value,
        alternates: buildAlternateLocaleLinks("/danh-muc")
      };
    });
    const categoryStructuredDataEntries = computed(() => {
      const category = categoryNews.value.category;
      if (!category) {
        return [];
      }
      const items = categoryNews.value.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: getLocalizedContent(item, "title", locale.value),
        url: buildLocalizedCanonicalUrl(buildNewsPath(item.slug), locale.value)
      }));
      return [
        {
          id: "category-breadcrumb",
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
                name: getLocalizedContent(category, "name", locale.value),
                item: categoryCanonicalUrl.value
              }
            ]
          }
        },
        {
          id: "category-collection",
          schema: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${t("common.category")} ${getLocalizedContent(category, "name", locale.value)} - VietNews 24h`,
            description: getLocalizedContent(category, "description", locale.value),
            url: categoryCanonicalUrl.value,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: items.length,
              itemListElement: items
            }
          }
        }
      ];
    });
    useSeoHead(categorySeoMeta);
    useStructuredDataHead(categoryStructuredDataEntries);
    const loadCategory = async () => {
      const slug = String(route.params.slug || "");
      await newsStore.fetchCategoryNews(slug, pageFromQuery.value);
    };
    const handlePageChange = (nextPage) => {
      router.push({
        path: `/danh-muc/${route.params.slug}`,
        query: nextPage > 1 ? { page: String(nextPage) } : {}
      });
    };
    onServerPrefetch(loadCategory);
    watch(
      () => [route.params.slug, route.query.page, locale.value],
      async () => {
        await loadCategory();
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "container-wide pt-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$2, { items: breadcrumbItems.value }, null, _parent));
      _push(`<div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_340px]"><div><h1 class="mb-5 text-3xl font-bold text-slate-900">${ssrInterpolate(pageTitle.value)}</h1>`);
      if (isLoading.value) {
        _push(ssrRenderComponent(_sfc_main$3, {
          count: 6,
          type: "card"
        }, null, _parent));
      } else if (errorMessage.value) {
        _push(ssrRenderComponent(_sfc_main$1$1, {
          title: unref(t)("categoryPage.loadErrorTitle"),
          description: errorMessage.value
        }, null, _parent));
      } else if (!categoryNews.value.category) {
        _push(ssrRenderComponent(_sfc_main$1$1, {
          title: unref(t)("categoryPage.notFoundTitle"),
          description: unref(t)("categoryPage.notFoundDescription")
        }, null, _parent));
      } else {
        _push(`<!--[--><div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><!--[-->`);
        ssrRenderList(categoryNews.value.items, (item) => {
          _push(ssrRenderComponent(_sfc_main$2$1, {
            key: item.id,
            item
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
        _push(ssrRenderComponent(_sfc_main$4, {
          page: categoryNews.value.pagination.page,
          "total-pages": categoryNews.value.pagination.totalPages,
          onChange: handlePageChange
        }, null, _parent));
        _push(`<!--]-->`);
      }
      _push(`</div><aside class="space-y-5">`);
      _push(ssrRenderComponent(_sfc_main$5, {
        title: unref(t)("news.sidebarFeatured"),
        items: categoryNews.value.sidebarItems
      }, null, _parent));
      _push(`</aside></div></section>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/CategoryView.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "[slug]",
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/danh-muc/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-BC4SzrOy.mjs.map
