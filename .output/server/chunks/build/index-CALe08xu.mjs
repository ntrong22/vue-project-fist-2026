import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { computed, onServerPrefetch, mergeProps, unref, withCtx, createVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { useI18n } from 'vue-i18n';
import { d as useCategoryStore, e as buildLocalizedCanonicalUrl, f as buildAlternateLocaleLinks, b as buildNewsPath, g as getLocalizedContent, h as useSeoHead, i as useStructuredDataHead, a as __nuxt_component_0$1, c as appConfig } from './server.mjs';
import { u as useNewsStore, _ as _sfc_main$6, a as _sfc_main$1$1, b as _sfc_main$2$1 } from './useNewsStore-DMAV_6AT.mjs';
import { _ as _sfc_main$7 } from './SidebarNews-BaOZfwvv.mjs';
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
import 'pinia';
import 'vue-router';
import 'isomorphic-dompurify';
import 'axios';

const _sfc_main$5 = {
  __name: "CategorySection",
  __ssrInlineRender: true,
  props: {
    category: {
      type: Object,
      required: true
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  setup(__props) {
    const props = __props;
    const { t, locale } = useI18n({ useScope: "global" });
    const headingId = computed(() => `category-section-${props.category.slug || props.category.id || "news"}`);
    const displayCategoryName = computed(() => getLocalizedContent(props.category, "name", locale.value));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<section${ssrRenderAttrs(mergeProps({
        "aria-labelledby": headingId.value,
        class: "mt-8"
      }, _attrs))}><div class="mb-4 flex items-center justify-between"><h2${ssrRenderAttr("id", headingId.value)} class="text-2xl font-bold text-slate-900">${ssrInterpolate(displayCategoryName.value)}</h2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/danh-muc/${props.category.slug}`,
        class: "text-sm font-medium text-brand-700 hover:text-brand-800"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("common.all"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("common.all")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><!--[-->`);
      ssrRenderList(props.items, (item) => {
        _push(ssrRenderComponent(_sfc_main$2$1, {
          key: item.id,
          item
        }, null, _parent));
      });
      _push(`<!--]--></div></section>`);
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/news/CategorySection.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = {
  __name: "FeaturedNews",
  __ssrInlineRender: true,
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  setup(__props) {
    const { t, locale } = useI18n({ useScope: "global" });
    const getText = (item, field) => getLocalizedContent(item, field, locale.value);
    const onImageError = (event) => {
      event.target.src = appConfig.fallbackImage;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<section${ssrRenderAttrs(mergeProps({
        "aria-labelledby": "featured-news-heading",
        class: "space-y-4"
      }, _attrs))}><h2 id="featured-news-heading" class="section-title">${ssrInterpolate(unref(t)("news.featured"))}</h2>`);
      if (__props.items.length) {
        _push(`<div class="grid gap-4 lg:grid-cols-3"><article class="relative overflow-hidden rounded-2xl lg:col-span-2">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(buildNewsPath)(__props.items[0].slug),
          class: "block"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<img${ssrRenderAttr("src", __props.items[0].thumbnail)}${ssrRenderAttr("alt", getText(__props.items[0], "title"))} class="h-[360px] w-full object-cover" loading="lazy"${_scopeId}><div class="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/35 to-transparent"${_scopeId}></div><div class="absolute bottom-0 p-6 text-white"${_scopeId}><p class="mb-2 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-xs"${_scopeId}>${ssrInterpolate(getText(__props.items[0], "categoryName"))}</p><h3 class="text-2xl font-bold leading-tight lg:text-3xl"${_scopeId}>${ssrInterpolate(getText(__props.items[0], "title"))}</h3><p class="mt-3 line-clamp-2 text-sm text-slate-100"${_scopeId}>${ssrInterpolate(getText(__props.items[0], "summary"))}</p></div>`);
            } else {
              return [
                createVNode("img", {
                  src: __props.items[0].thumbnail,
                  alt: getText(__props.items[0], "title"),
                  class: "h-[360px] w-full object-cover",
                  loading: "lazy",
                  onError: onImageError
                }, null, 40, ["src", "alt"]),
                createVNode("div", { class: "absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/35 to-transparent" }),
                createVNode("div", { class: "absolute bottom-0 p-6 text-white" }, [
                  createVNode("p", { class: "mb-2 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-xs" }, toDisplayString(getText(__props.items[0], "categoryName")), 1),
                  createVNode("h3", { class: "text-2xl font-bold leading-tight lg:text-3xl" }, toDisplayString(getText(__props.items[0], "title")), 1),
                  createVNode("p", { class: "mt-3 line-clamp-2 text-sm text-slate-100" }, toDisplayString(getText(__props.items[0], "summary")), 1)
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</article><div class="space-y-4"><!--[-->`);
        ssrRenderList(__props.items.slice(1, 4), (item) => {
          _push(ssrRenderComponent(_sfc_main$2$1, {
            key: item.id,
            item
          }, null, _parent));
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<div class="card-surface p-6 text-sm text-slate-600">${ssrInterpolate(unref(t)("news.featuredEmpty"))}</div>`);
      }
      _push(`</section>`);
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/news/FeaturedNews.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = {
  __name: "LatestNews",
  __ssrInlineRender: true,
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  setup(__props) {
    const { t } = useI18n({ useScope: "global" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<section${ssrRenderAttrs(mergeProps({ "aria-labelledby": "latest-news-heading" }, _attrs))}><div class="mb-5 flex items-center justify-between"><h2 id="latest-news-heading" class="section-title mb-0">${ssrInterpolate(unref(t)("news.latest"))}</h2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/tin-tuc",
        class: "text-sm font-medium text-brand-700 hover:text-brand-800"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("common.readMore"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("common.readMore")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><!--[-->`);
      ssrRenderList(__props.items, (item) => {
        _push(ssrRenderComponent(_sfc_main$2$1, {
          key: item.id,
          item
        }, null, _parent));
      });
      _push(`<!--]--></div></section>`);
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/news/LatestNews.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = {
  __name: "PopularNews",
  __ssrInlineRender: true,
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  setup(__props) {
    const { t, locale } = useI18n({ useScope: "global" });
    const getText = (item, field) => getLocalizedContent(item, field, locale.value);
    const formatViewCount = (value) => Number(value || 0).toLocaleString(locale.value === "en" ? "en-US" : "vi-VN");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<section${ssrRenderAttrs(mergeProps({
        "aria-labelledby": "popular-news-heading",
        class: "card-surface p-5"
      }, _attrs))}><h2 id="popular-news-heading" class="mb-4 text-xl font-bold text-slate-900">${ssrInterpolate(unref(t)("news.popular"))}</h2><ol class="space-y-4"><!--[-->`);
      ssrRenderList(__props.items, (item, index) => {
        _push(`<li class="flex gap-3"><span class="mt-1 text-xl font-bold text-brand-600">${ssrInterpolate(index + 1)}</span><div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(buildNewsPath)(item.slug),
          class: "line-clamp-2 font-medium text-slate-800 hover:text-brand-700"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(getText(item, "title"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(getText(item, "title")), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`<p class="mt-1 text-xs text-slate-500">${ssrInterpolate(formatViewCount(item.viewCount))} ${ssrInterpolate(unref(t)("common.views"))}</p></div></li>`);
      });
      _push(`<!--]--></ol></section>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/news/PopularNews.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "HomeView",
  __ssrInlineRender: true,
  setup(__props) {
    const newsStore = useNewsStore();
    const categoryStore = useCategoryStore();
    const { t, locale } = useI18n({ useScope: "global" });
    const homeData = computed(() => newsStore.homeData);
    const isLoading = computed(() => newsStore.loading.home);
    const errorMessage = computed(() => newsStore.error.home);
    const categorySections = computed(() => {
      return homeData.value.categorySections.filter((section) => section.items.length > 0);
    });
    const homeCanonicalUrl = computed(() => buildLocalizedCanonicalUrl("/", locale.value));
    const homeSeoMeta = computed(() => ({
      title: t("seo.home.title"),
      description: t("seo.home.description"),
      keywords: t("seo.home.keywords"),
      canonical: homeCanonicalUrl.value,
      locale: locale.value,
      alternates: buildAlternateLocaleLinks("/")
    }));
    const homeStructuredDataEntries = computed(() => {
      const latestItems = homeData.value.latest.slice(0, 10);
      const itemListElement = latestItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: getLocalizedContent(item, "title", locale.value),
        url: buildLocalizedCanonicalUrl(buildNewsPath(item.slug), locale.value)
      }));
      return [
        {
          id: "home-collection",
          schema: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: t("seo.home.title"),
            description: t("seo.home.description"),
            url: homeCanonicalUrl.value,
            mainEntity: {
              "@type": "ItemList",
              itemListOrder: "https://schema.org/ItemListOrderDescending",
              numberOfItems: itemListElement.length,
              itemListElement
            }
          }
        }
      ];
    });
    useSeoHead(homeSeoMeta);
    useStructuredDataHead(homeStructuredDataEntries);
    const loadHome = async () => {
      if (!categoryStore.hasCategories) {
        await categoryStore.fetchCategories();
      }
      await newsStore.fetchHomeNews();
    };
    onServerPrefetch(loadHome);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-wide pt-6" }, _attrs))}><h1 class="sr-only">${ssrInterpolate(unref(t)("home.srTitle"))}</h1>`);
      _push(ssrRenderComponent(_sfc_main$4, {
        items: homeData.value.featured
      }, null, _parent));
      _push(`<section class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"><div class="space-y-8">`);
      if (isLoading.value) {
        _push(ssrRenderComponent(_sfc_main$6, {
          count: 6,
          type: "card"
        }, null, _parent));
      } else if (errorMessage.value) {
        _push(ssrRenderComponent(_sfc_main$1$1, {
          title: unref(t)("home.errorTitle"),
          description: errorMessage.value
        }, null, _parent));
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_sfc_main$3, {
          items: homeData.value.latest.slice(0, 6)
        }, null, _parent));
        _push(ssrRenderComponent(_sfc_main$2, {
          items: homeData.value.popular.slice(0, 5)
        }, null, _parent));
        _push(`<section aria-labelledby="hot-news-heading"><h2 id="hot-news-heading" class="section-title">${ssrInterpolate(unref(t)("home.hotTitle"))}</h2><div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><!--[-->`);
        ssrRenderList(homeData.value.hot.slice(0, 6), (item) => {
          _push(ssrRenderComponent(_sfc_main$2$1, {
            key: item.id,
            item
          }, null, _parent));
        });
        _push(`<!--]--></div></section><!--[-->`);
        ssrRenderList(categorySections.value, (section) => {
          _push(ssrRenderComponent(_sfc_main$5, {
            key: section.category.id,
            category: section.category,
            items: section.items
          }, null, _parent));
        });
        _push(`<!--]--><!--]-->`);
      }
      _push(`</div><aside class="space-y-5"${ssrRenderAttr("aria-label", unref(t)("news.sidebarFeatured"))}>`);
      _push(ssrRenderComponent(_sfc_main$7, {
        title: unref(t)("home.topReads"),
        items: homeData.value.sidebar.topReads
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$7, {
        title: unref(t)("home.hotPicks"),
        items: homeData.value.sidebar.hotPicks
      }, null, _parent));
      _push(`</aside></section></div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/HomeView.vue");
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CALe08xu.mjs.map
