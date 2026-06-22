import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { g as getLocalizedContent, l as buildCategoryPath, m as generateSlug, o as sanitizeHtml, f as buildAlternateLocaleLinks, e as buildLocalizedCanonicalUrl, p as buildCanonicalUrl, q as buildAbsoluteUrl, h as useSeoHead, i as useStructuredDataHead, a as __nuxt_component_0$1 } from './server.mjs';
import { computed, onServerPrefetch, watch, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { _ as _sfc_main$2 } from './Breadcrumb-DcrKZ2Ot.mjs';
import { u as useNewsStore, f as formatDate, _ as _sfc_main$3, a as _sfc_main$1$1, b as _sfc_main$2$1 } from './useNewsStore-DMAV_6AT.mjs';
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
import 'isomorphic-dompurify';
import 'axios';

const _sfc_main$1 = {
  __name: "NewsDetailView",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const newsStore = useNewsStore();
    const { t, locale } = useI18n({ useScope: "global" });
    const newsDetail = computed(() => newsStore.newsDetail);
    const relatedNews = computed(() => newsStore.relatedNews);
    const isLoading = computed(() => newsStore.loading.detail);
    const errorMessage = computed(() => newsStore.error.detail);
    const displayTitle = computed(() => getLocalizedContent(newsDetail.value, "title", locale.value));
    const displaySummary = computed(() => getLocalizedContent(newsDetail.value, "summary", locale.value));
    const displayCategoryName = computed(() => getLocalizedContent(newsDetail.value, "categoryName", locale.value));
    const displayAuthor = computed(() => getLocalizedContent(newsDetail.value, "author", locale.value));
    const formattedDate = computed(
      () => {
        var _a;
        return formatDate((_a = newsDetail.value) == null ? void 0 : _a.publishedAt, locale.value === "en" ? "en-US" : "vi-VN");
      }
    );
    const formattedViewCount = computed(
      () => {
        var _a;
        return Number(((_a = newsDetail.value) == null ? void 0 : _a.viewCount) || 0).toLocaleString(locale.value === "en" ? "en-US" : "vi-VN");
      }
    );
    const breadcrumbItems = computed(() => {
      if (!newsDetail.value) {
        return [{ label: t("news.latest") }];
      }
      return [
        {
          label: displayCategoryName.value,
          to: buildCategoryPath(newsDetail.value.categorySlug || generateSlug(displayCategoryName.value))
        },
        {
          label: displayTitle.value
        }
      ];
    });
    const sanitizedContent = computed(
      () => sanitizeHtml(getLocalizedContent(newsDetail.value, "content", locale.value) || "")
    );
    const newsDetailSeoMeta = computed(() => {
      const item = newsDetail.value;
      if (item) {
        return {
          title: getLocalizedContent(item, "seoTitle", locale.value) || displayTitle.value,
          description: getLocalizedContent(item, "seoDescription", locale.value) || displaySummary.value,
          keywords: getLocalizedContent(item, "seoKeywords", locale.value),
          ogTitle: displayTitle.value,
          ogDescription: displaySummary.value,
          ogImage: item.thumbnail,
          canonical: buildLocalizedCanonicalUrl(`/tin-tuc/${item.slug}`, locale.value),
          ogType: "article",
          robots: "index, follow, max-image-preview:large",
          locale: locale.value,
          alternates: buildAlternateLocaleLinks(`/tin-tuc/${item.slug}`)
        };
      }
      return {
        title: t("seo.newsNotFound.title"),
        description: t("seo.newsNotFound.description"),
        keywords: t("seo.newsNotFound.keywords"),
        canonical: buildLocalizedCanonicalUrl("/tin-tuc", locale.value),
        robots: "noindex, follow",
        locale: locale.value,
        alternates: buildAlternateLocaleLinks("/tin-tuc")
      };
    });
    const newsDetailStructuredDataEntries = computed(() => {
      const item = newsDetail.value;
      if (!item) {
        return [];
      }
      const newsUrl = buildLocalizedCanonicalUrl(`/tin-tuc/${item.slug}`, locale.value);
      const categoryUrl = buildLocalizedCanonicalUrl(
        buildCategoryPath(item.categorySlug || generateSlug(displayCategoryName.value)),
        locale.value
      );
      return [
        {
          id: "news-breadcrumb",
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
                name: displayCategoryName.value,
                item: categoryUrl
              },
              {
                "@type": "ListItem",
                position: 3,
                name: displayTitle.value,
                item: newsUrl
              }
            ]
          }
        },
        {
          id: "news-article",
          schema: {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: displayTitle.value,
            description: getLocalizedContent(item, "seoDescription", locale.value) || displaySummary.value,
            articleBody: displaySummary.value,
            image: [buildAbsoluteUrl(item.thumbnail) || buildCanonicalUrl("/images/og-default.svg")],
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": newsUrl
            },
            author: {
              "@type": "Person",
              name: displayAuthor.value || t("common.editorialTeam")
            },
            publisher: {
              "@type": "Organization",
              name: "VietNews 24h",
              logo: {
                "@type": "ImageObject",
                url: buildCanonicalUrl("/favicon.svg")
              }
            },
            datePublished: item.publishedAt,
            dateModified: item.updatedAt || item.publishedAt,
            articleSection: displayCategoryName.value,
            keywords: item.tags
          }
        }
      ];
    });
    useSeoHead(newsDetailSeoMeta);
    useStructuredDataHead(newsDetailStructuredDataEntries);
    const loadNewsDetail = async () => {
      const slug = String(route.params.slug || "");
      await newsStore.fetchNewsDetail(slug);
    };
    onServerPrefetch(loadNewsDetail);
    watch(
      () => [route.params.slug, locale.value],
      async () => {
        await loadNewsDetail();
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<article${ssrRenderAttrs(mergeProps({ class: "container-wide pt-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$2, { items: breadcrumbItems.value }, null, _parent));
      if (isLoading.value) {
        _push(ssrRenderComponent(_sfc_main$3, {
          count: 3,
          type: "list"
        }, null, _parent));
      } else if (errorMessage.value) {
        _push(ssrRenderComponent(_sfc_main$1$1, {
          title: unref(t)("news.detailLoadError"),
          description: errorMessage.value
        }, null, _parent));
      } else if (!newsDetail.value) {
        _push(ssrRenderComponent(_sfc_main$1$1, {
          title: unref(t)("news.detailNotFoundTitle"),
          description: unref(t)("news.detailNotFoundDescription")
        }, null, _parent));
      } else {
        _push(`<!--[--><header class="mb-6"><h1 class="mb-4 text-3xl font-bold leading-tight text-slate-900 lg:text-4xl">${ssrInterpolate(displayTitle.value)}</h1><div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500"><span>${ssrInterpolate(formattedDate.value)}</span><span>${ssrInterpolate(unref(t)("common.author"))}: ${ssrInterpolate(displayAuthor.value)}</span><span>${ssrInterpolate(formattedViewCount.value)} ${ssrInterpolate(unref(t)("common.views"))}</span></div></header><figure class="mb-6 overflow-hidden rounded-2xl bg-slate-200"><img${ssrRenderAttr("src", newsDetail.value.thumbnail)}${ssrRenderAttr("alt", displayTitle.value)} class="h-auto w-full" loading="lazy"></figure><section class="card-surface p-6 lg:p-8"><div class="rich-content">${(_a = sanitizedContent.value) != null ? _a : ""}</div>`);
        if ((_b = newsDetail.value.tags) == null ? void 0 : _b.length) {
          _push(`<div class="mt-8 border-t border-slate-200 pt-4"><h2 class="mb-2 text-base font-semibold text-slate-900">${ssrInterpolate(unref(t)("common.tags"))}</h2><div class="flex flex-wrap gap-2"><!--[-->`);
          ssrRenderList(newsDetail.value.tags, (tag) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: tag,
              to: { path: "/tim-kiem", query: { q: tag } },
              class: "rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 transition hover:bg-brand-100 hover:text-brand-700"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` #${ssrInterpolate(tag)}`);
                } else {
                  return [
                    createTextVNode(" #" + toDisplayString(tag), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section><section class="mt-10" aria-labelledby="related-news-heading"><h2 id="related-news-heading" class="section-title">${ssrInterpolate(unref(t)("news.related"))}</h2><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><!--[-->`);
        ssrRenderList(relatedNews.value, (item) => {
          _push(ssrRenderComponent(_sfc_main$2$1, {
            key: item.id,
            item
          }, null, _parent));
        });
        _push(`<!--]--></div></section><!--]-->`);
      }
      _push(`</article>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/NewsDetailView.vue");
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/tin-tuc/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-DlqJLZe7.mjs.map
