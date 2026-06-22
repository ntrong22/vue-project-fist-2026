import { c as appConfig, n as normalizeSearchInput, y as getSafeErrorMessage, g as getLocalizedContent, b as buildNewsPath, m as generateSlug, l as buildCategoryPath, a as __nuxt_component_0$1, r as normalizeSlug, t as apiClient, v as normalizeCategoryList, x as categories, w as categoryService } from './server.mjs';
import { computed, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderSlot, ssrRenderComponent, ssrRenderAttr } from 'vue/server-renderer';
import { useI18n } from 'vue-i18n';
import { defineStore } from 'pinia';

const formatDate = (value, locale = "vi-VN") => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};
const formatDateOnly = (value, locale = "vi-VN") => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
};
const sortByPublishedAtDesc = (items = []) => {
  return [...items].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
};
const _sfc_main$2 = {
  __name: "NewsCard",
  __ssrInlineRender: true,
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const { locale } = useI18n({ useScope: "global" });
    const displayTitle = computed(() => getLocalizedContent(props.item, "title", locale.value));
    const displaySummary = computed(() => getLocalizedContent(props.item, "summary", locale.value));
    const displayCategoryName = computed(() => getLocalizedContent(props.item, "categoryName", locale.value));
    const displayAuthor = computed(() => getLocalizedContent(props.item, "author", locale.value));
    const dateLocale = computed(() => locale.value === "en" ? "en-US" : "vi-VN");
    const newsPath = computed(() => buildNewsPath(props.item.slug));
    const categoryPath = computed(() => {
      const safeCategorySlug = props.item.categorySlug || generateSlug(displayCategoryName.value);
      return buildCategoryPath(safeCategorySlug);
    });
    const onImageError = (event) => {
      event.target.src = appConfig.fallbackImage;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<article${ssrRenderAttrs(mergeProps({ class: "card-surface group overflow-hidden" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: newsPath.value,
        class: "block overflow-hidden"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img${ssrRenderAttr("src", __props.item.thumbnail)}${ssrRenderAttr("alt", displayTitle.value)} class="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy"${_scopeId}>`);
          } else {
            return [
              createVNode("img", {
                src: __props.item.thumbnail,
                alt: displayTitle.value,
                class: "h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]",
                loading: "lazy",
                onError: onImageError
              }, null, 40, ["src", "alt"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="p-4">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: categoryPath.value,
        class: "mb-2 inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(displayCategoryName.value)}`);
          } else {
            return [
              createTextVNode(toDisplayString(displayCategoryName.value), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<h3 class="line-clamp-2 text-lg font-bold leading-snug text-slate-900">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: newsPath.value,
        class: "transition group-hover:text-brand-700"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(displayTitle.value)}`);
          } else {
            return [
              createTextVNode(toDisplayString(displayTitle.value), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</h3><p class="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">${ssrInterpolate(displaySummary.value)}</p><div class="mt-4 flex items-center justify-between gap-2 text-xs text-slate-500"><span>${ssrInterpolate(unref(formatDateOnly)(__props.item.publishedAt, dateLocale.value))}</span><span class="truncate">${ssrInterpolate(displayAuthor.value)}</span></div></div></article>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/news/NewsCard.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "EmptyState",
  __ssrInlineRender: true,
  props: {
    title: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    }
  },
  setup(__props) {
    const { t } = useI18n({ useScope: "global" });
    const props = __props;
    const resolvedTitle = computed(() => props.title || t("common.emptyTitle"));
    const resolvedDescription = computed(() => props.description || t("common.emptyDescription"));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "card-surface p-8 text-center" }, _attrs))}><h3 class="mb-2 text-lg font-semibold text-slate-900">${ssrInterpolate(resolvedTitle.value)}</h3><p class="mx-auto max-w-xl text-slate-600">${ssrInterpolate(resolvedDescription.value)}</p>`);
      if (_ctx.$slots.action) {
        _push(`<div class="mt-5">`);
        ssrRenderSlot(_ctx.$slots, "action", {}, null, _push, _parent);
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/common/EmptyState.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "LoadingSkeleton",
  __ssrInlineRender: true,
  props: {
    count: {
      type: Number,
      default: 6
    },
    type: {
      type: String,
      default: "card"
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (__props.type === "card") {
        _push(`<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(__props.count, (item) => {
          _push(`<div class="card-surface overflow-hidden"><div class="h-44 animate-pulse bg-slate-200"></div><div class="space-y-3 p-4"><div class="h-4 w-1/3 animate-pulse rounded bg-slate-200"></div><div class="h-5 w-full animate-pulse rounded bg-slate-200"></div><div class="h-4 w-5/6 animate-pulse rounded bg-slate-200"></div><div class="h-4 w-2/3 animate-pulse rounded bg-slate-200"></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="space-y-4"><!--[-->`);
        ssrRenderList(__props.count, (item) => {
          _push(`<div class="card-surface p-4"><div class="mb-3 h-5 w-2/3 animate-pulse rounded bg-slate-200"></div><div class="h-4 w-full animate-pulse rounded bg-slate-200"></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/common/LoadingSkeleton.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const toSlug = (value = "") => {
  return value.replace(/đ/g, "d").replace(/Đ/g, "D").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
};
const newsSeeds = [
  {
    title: "Th\xE0nh ph\u1ED1 \u0111\u1EA9y m\u1EA1nh chuy\u1EC3n \u0111\u1ED5i s\u1ED1 trong d\u1ECBch v\u1EE5 c\xF4ng",
    summary: "Nhi\u1EC1u th\u1EE7 t\u1EE5c h\xE0nh ch\xEDnh \u0111\u01B0\u1EE3c r\xFAt ng\u1EAFn th\u1EDDi gian x\u1EED l\xFD nh\u1EDD n\u1EC1n t\u1EA3ng s\u1ED1 th\u1ED1ng nh\u1EA5t.",
    categoryId: 1,
    categoryName: "Th\u1EDDi s\u1EF1",
    author: "Minh Qu\xE2n",
    publishedAt: "2026-05-23T07:20:00.000Z",
    viewCount: 12500,
    isFeatured: true,
    isHot: true,
    tags: ["chuy\u1EC3n \u0111\u1ED5i s\u1ED1", "d\u1ECBch v\u1EE5 c\xF4ng", "\u0111\xF4 th\u1ECB th\xF4ng minh"]
  },
  {
    title: "Doanh nghi\u1EC7p b\xE1n l\u1EBB t\u0103ng t\u1ED1c m\u1EDF r\u1ED9ng m\xF4 h\xECnh c\u1EEDa h\xE0ng xanh",
    summary: "M\xF4 h\xECnh ti\u1EBFt ki\u1EC7m n\u0103ng l\u01B0\u1EE3ng gi\xFAp gi\u1EA3m chi ph\xED v\u1EADn h\xE0nh v\xE0 thu h\xFAt nh\xF3m kh\xE1ch h\xE0ng tr\u1EBB.",
    categoryId: 2,
    categoryName: "Kinh doanh",
    author: "H\u1EA3i An",
    publishedAt: "2026-05-23T06:35:00.000Z",
    viewCount: 10980,
    isFeatured: true,
    isHot: false,
    tags: ["b\xE1n l\u1EBB", "ph\xE1t tri\u1EC3n b\u1EC1n v\u1EEFng", "m\xF4i tr\u01B0\u1EDDng"]
  },
  {
    title: "Startup Vi\u1EC7t c\xF4ng b\u1ED1 n\u1EC1n t\u1EA3ng AI h\u1ED7 tr\u1EE3 ch\u0103m s\xF3c kh\xE1ch h\xE0ng \u0111a k\xEAnh",
    summary: "Gi\u1EA3i ph\xE1p m\u1EDBi cho ph\xE9p t\u1EF1 \u0111\u1ED9ng h\xF3a ph\u1EA3n h\u1ED3i v\xE0 c\xE1 nh\xE2n h\xF3a tr\u1EA3i nghi\u1EC7m theo h\xE0nh vi ng\u01B0\u1EDDi d\xF9ng.",
    categoryId: 3,
    categoryName: "C\xF4ng ngh\u1EC7",
    author: "Ng\u1ECDc B\xEDch",
    publishedAt: "2026-05-23T05:55:00.000Z",
    viewCount: 14620,
    isFeatured: true,
    isHot: true,
    tags: ["AI", "startup", "ch\u0103m s\xF3c kh\xE1ch h\xE0ng"]
  },
  {
    title: "Kinh t\u1EBF khu v\u1EF1c ghi nh\u1EADn t\xEDn hi\u1EC7u ph\u1EE5c h\u1ED3i t\xEDch c\u1EF1c qu\xFD II",
    summary: "Nhi\u1EC1u ng\xE0nh d\u1ECBch v\u1EE5 t\u0103ng tr\u01B0\u1EDFng tr\u1EDF l\u1EA1i, t\u1EA1o th\xEAm vi\u1EC7c l\xE0m t\u1EA1i c\xE1c trung t\xE2m \u0111\xF4 th\u1ECB l\u1EDBn.",
    categoryId: 4,
    categoryName: "Th\u1EBF gi\u1EDBi",
    author: "Thanh H\xE0",
    publishedAt: "2026-05-22T22:10:00.000Z",
    viewCount: 9420,
    isFeatured: false,
    isHot: true,
    tags: ["kinh t\u1EBF", "khu v\u1EF1c", "qu\xFD II"]
  },
  {
    title: "\u0110\u1ED9i tuy\u1EC3n qu\u1ED1c gia c\xF4ng b\u1ED1 danh s\xE1ch chu\u1EA9n b\u1ECB cho gi\u1EA3i ch\xE2u l\u1EE5c",
    summary: "Ban hu\u1EA5n luy\u1EC7n \u01B0u ti\xEAn nh\xE2n t\u1ED1 tr\u1EBB, h\u01B0\u1EDBng \u0111\u1EBFn l\u1ED1i ch\u01A1i t\u1ED1c \u0111\u1ED9 v\xE0 pressing hi\u1EC7n \u0111\u1EA1i.",
    categoryId: 5,
    categoryName: "Th\u1EC3 thao",
    author: "Tu\u1EA5n Phong",
    publishedAt: "2026-05-22T20:05:00.000Z",
    viewCount: 15730,
    isFeatured: false,
    isHot: true,
    tags: ["\u0111\u1ED9i tuy\u1EC3n", "b\xF3ng \u0111\xE1", "chi\u1EBFn thu\u1EADt"]
  },
  {
    title: "Li\xEAn hoan phim m\xF9a h\xE8 thu h\xFAt d\xE0n \u0111\u1EA1o di\u1EC5n tr\u1EBB khu v\u1EF1c",
    summary: "Nhi\u1EC1u t\xE1c ph\u1EA9m \u0111\u1ED9c l\u1EADp mang ch\u1EE7 \u0111\u1EC1 x\xE3 h\u1ED9i \u0111\u01B0\u01A1ng \u0111\u1EA1i nh\u1EADn \u0111\u01B0\u1EE3c s\u1EF1 quan t\xE2m t\u1EEB gi\u1EDBi ph\xEA b\xECnh.",
    categoryId: 6,
    categoryName: "Gi\u1EA3i tr\xED",
    author: "Uy\xEAn Linh",
    publishedAt: "2026-05-22T18:40:00.000Z",
    viewCount: 8320,
    isFeatured: false,
    isHot: false,
    tags: ["li\xEAn hoan phim", "\u0111\u1EA1o di\u1EC5n tr\u1EBB", "\u0111i\u1EC7n \u1EA3nh"]
  },
  {
    title: "B\u1EC7nh vi\u1EC7n trung \u01B0\u01A1ng tri\u1EC3n khai kh\xE1m t\u1EEB xa cho tuy\u1EBFn huy\u1EC7n",
    summary: "H\u1EC7 th\u1ED1ng h\u1ED9i ch\u1EA9n tr\u1EF1c tuy\u1EBFn gi\xFAp b\xE1c s\u0129 \u0111\u1ECBa ph\u01B0\u01A1ng ti\u1EBFp c\u1EADn chuy\xEAn gia nhanh h\u01A1n.",
    categoryId: 7,
    categoryName: "S\u1EE9c kh\u1ECFe",
    author: "Kh\xE1nh Vy",
    publishedAt: "2026-05-22T17:20:00.000Z",
    viewCount: 7620,
    isFeatured: false,
    isHot: false,
    tags: ["telehealth", "b\u1EC7nh vi\u1EC7n", "kh\xE1m t\u1EEB xa"]
  },
  {
    title: "Nhi\u1EC1u tr\u01B0\u1EDDng \u0111\u1EA1i h\u1ECDc m\u1EDF ng\xE0nh m\u1EDBi v\u1EC1 d\u1EEF li\u1EC7u v\xE0 t\u1EF1 \u0111\u1ED9ng h\xF3a",
    summary: "Ch\u01B0\u01A1ng tr\xECnh \u0111\xE0o t\u1EA1o c\u1EADp nh\u1EADt theo nhu c\u1EA7u nh\xE2n l\u1EF1c trong b\u1ED1i c\u1EA3nh doanh nghi\u1EC7p chuy\u1EC3n \u0111\u1ED5i s\u1ED1.",
    categoryId: 8,
    categoryName: "Gi\xE1o d\u1EE5c",
    author: "Ph\u01B0\u01A1ng Mai",
    publishedAt: "2026-05-22T15:55:00.000Z",
    viewCount: 9180,
    isFeatured: false,
    isHot: true,
    tags: ["\u0111\u1EA1i h\u1ECDc", "d\u1EEF li\u1EC7u", "t\u1EF1 \u0111\u1ED9ng h\xF3a"]
  },
  {
    title: "H\u1EA1 t\u1EA7ng giao th\xF4ng li\xEAn v\xF9ng \u0111\u01B0\u1EE3c th\xFAc \u0111\u1EA9y b\u1EB1ng c\u01A1 ch\u1EBF m\u1EDBi",
    summary: "Nhi\u1EC1u d\u1EF1 \xE1n tr\u1ECDng \u0111i\u1EC3m \u0111\u01B0\u1EE3c th\xE1o g\u1EE1 v\u01B0\u1EDBng m\u1EAFc, d\u1EF1 ki\u1EBFn t\u0103ng t\u1ED1c gi\u1EA3i ng\xE2n n\u1EEDa cu\u1ED1i n\u0103m.",
    categoryId: 1,
    categoryName: "Th\u1EDDi s\u1EF1",
    author: "H\u1EEFu \u0110\u1EA1t",
    publishedAt: "2026-05-22T13:45:00.000Z",
    viewCount: 10140,
    isFeatured: false,
    isHot: false,
    tags: ["giao th\xF4ng", "\u0111\u1EA7u t\u01B0 c\xF4ng", "li\xEAn v\xF9ng"]
  },
  {
    title: "N\u1EC1n t\u1EA3ng th\u01B0\u01A1ng m\u1EA1i \u0111i\u1EC7n t\u1EED n\u1ED9i \u0111\u1ECBa t\u0103ng tr\u01B0\u1EDFng \u0111\u01A1n h\xE0ng xuy\xEAn bi\xEAn gi\u1EDBi",
    summary: "Doanh nghi\u1EC7p nh\u1ECF t\u1EADn d\u1EE5ng logistics s\u1ED1 \u0111\u1EC3 \u0111\u01B0a s\u1EA3n ph\u1EA9m th\u1EE7 c\xF4ng ra th\u1ECB tr\u01B0\u1EDDng qu\u1ED1c t\u1EBF.",
    categoryId: 2,
    categoryName: "Kinh doanh",
    author: "\u0110\u1EE9c Tr\u1ECDng",
    publishedAt: "2026-05-22T12:10:00.000Z",
    viewCount: 12650,
    isFeatured: true,
    isHot: true,
    tags: ["th\u01B0\u01A1ng m\u1EA1i \u0111i\u1EC7n t\u1EED", "xu\u1EA5t kh\u1EA9u", "logistics"]
  },
  {
    title: "H\xE3ng c\xF4ng ngh\u1EC7 gi\u1EDBi thi\u1EC7u laptop AI t\u1ED1i \u01B0u n\u0103ng su\u1EA5t l\xE0m vi\u1EC7c",
    summary: "Thi\u1EBFt b\u1ECB m\u1EDBi t\xEDch h\u1EE3p tr\u1EE3 l\xFD th\xF4ng minh v\xE0 kh\u1EA3 n\u0103ng x\u1EED l\xFD c\u1EE5c b\u1ED9 cho t\xE1c v\u1EE5 v\u0103n ph\xF2ng.",
    categoryId: 3,
    categoryName: "C\xF4ng ngh\u1EC7",
    author: "Nam H\u01B0ng",
    publishedAt: "2026-05-22T11:30:00.000Z",
    viewCount: 13220,
    isFeatured: false,
    isHot: true,
    tags: ["laptop", "AI PC", "n\u0103ng su\u1EA5t"]
  },
  {
    title: "Quan h\u1EC7 th\u01B0\u01A1ng m\u1EA1i song ph\u01B0\u01A1ng m\u1EDF r\u1ED9ng \u1EDF nh\xF3m ng\xE0nh d\u1ECBch v\u1EE5 s\u1ED1",
    summary: "C\xE1c hi\u1EC7p \u0111\u1ECBnh m\u1EDBi t\u1EA1o thu\u1EADn l\u1EE3i cho doanh nghi\u1EC7p c\xF4ng ngh\u1EC7 m\u1EDF r\u1ED9ng th\u1ECB tr\u01B0\u1EDDng.",
    categoryId: 4,
    categoryName: "Th\u1EBF gi\u1EDBi",
    author: "L\u1EC7 Quy\xEAn",
    publishedAt: "2026-05-22T10:45:00.000Z",
    viewCount: 8840,
    isFeatured: false,
    isHot: false,
    tags: ["th\u01B0\u01A1ng m\u1EA1i", "d\u1ECBch v\u1EE5 s\u1ED1", "h\u1EE3p t\xE1c"]
  },
  {
    title: "Gi\u1EA3i marathon th\xE0nh ph\u1ED1 ghi nh\u1EADn k\u1EF7 l\u1EE5c ng\u01B0\u1EDDi tham d\u1EF1",
    summary: "S\u1EF1 ki\u1EC7n lan t\u1ECFa tinh th\u1EA7n s\u1ED1ng kh\u1ECFe, thu h\xFAt \u0111\xF4ng \u0111\u1EA3o v\u1EADn \u0111\u1ED9ng vi\xEAn qu\u1ED1c t\u1EBF.",
    categoryId: 5,
    categoryName: "Th\u1EC3 thao",
    author: "Qu\u1ED1c Kh\u1EA3i",
    publishedAt: "2026-05-22T09:20:00.000Z",
    viewCount: 11450,
    isFeatured: false,
    isHot: false,
    tags: ["marathon", "s\u1EE9c b\u1EC1n", "s\u1EF1 ki\u1EC7n"]
  },
  {
    title: "Ch\u01B0\u01A1ng tr\xECnh \xE2m nh\u1EA1c tr\u1EF1c ti\u1EBFp \u1EE9ng d\u1EE5ng s\xE2n kh\u1EA5u th\u1EF1c t\u1EBF \u1EA3o",
    summary: "Kh\xE1n gi\u1EA3 c\xF3 th\u1EC3 t\u01B0\u01A1ng t\xE1c theo th\u1EDDi gian th\u1EF1c qua n\u1EC1n t\u1EA3ng ph\xE1t s\xF3ng \u0111a l\u1EDBp.",
    categoryId: 6,
    categoryName: "Gi\u1EA3i tr\xED",
    author: "Gia B\u1EA3o",
    publishedAt: "2026-05-22T08:05:00.000Z",
    viewCount: 9730,
    isFeatured: false,
    isHot: true,
    tags: ["\xE2m nh\u1EA1c", "th\u1EF1c t\u1EBF \u1EA3o", "livestream"]
  },
  {
    title: "C\xE1c chuy\xEAn gia c\u1EA3nh b\xE1o th\xF3i quen ng\u1EE7 mu\u1ED9n k\xE9o d\xE0i \u1EDF gi\u1EDBi tr\u1EBB",
    summary: "Thi\u1EBFu ng\u1EE7 \u1EA3nh h\u01B0\u1EDFng tr\u1EF1c ti\u1EBFp \u0111\u1EBFn tr\xED nh\u1EDB, t\xE2m tr\u1EA1ng v\xE0 hi\u1EC7u qu\u1EA3 h\u1ECDc t\u1EADp, l\xE0m vi\u1EC7c.",
    categoryId: 7,
    categoryName: "S\u1EE9c kh\u1ECFe",
    author: "B\u1EA3o Y\u1EBFn",
    publishedAt: "2026-05-22T07:15:00.000Z",
    viewCount: 7950,
    isFeatured: false,
    isHot: true,
    tags: ["gi\u1EA5c ng\u1EE7", "l\u1ED1i s\u1ED1ng", "s\u1EE9c kh\u1ECFe tinh th\u1EA7n"]
  },
  {
    title: "H\u1ECDc sinh th\xE0nh ph\u1ED1 gi\xE0nh gi\u1EA3i cao t\u1EA1i cu\u1ED9c thi robot qu\u1ED1c t\u1EBF",
    summary: "D\u1EF1 \xE1n s\u1EED d\u1EE5ng c\u1EA3m bi\u1EBFn th\xF4ng minh v\xE0 t\u01B0 duy thi\u1EBFt k\u1EBF \u0111\u1EC3 gi\u1EA3i quy\u1EBFt b\xE0i to\xE1n m\xF4i tr\u01B0\u1EDDng.",
    categoryId: 8,
    categoryName: "Gi\xE1o d\u1EE5c",
    author: "\u0110an Th\u01B0",
    publishedAt: "2026-05-22T06:10:00.000Z",
    viewCount: 12410,
    isFeatured: false,
    isHot: false,
    tags: ["robot", "h\u1ECDc sinh", "s\xE1ng t\u1EA1o"]
  },
  {
    title: "Th\xE0nh ph\u1ED1 m\u1EDF r\u1ED9ng kh\xF4ng gian c\xF4ng c\u1ED9ng ph\u1EE5c v\u1EE5 c\u1ED9ng \u0111\u1ED3ng",
    summary: "C\xE1c tuy\u1EBFn ph\u1ED1 \u0111i b\u1ED9 m\u1EDBi k\u1EBFt h\u1EE3p ho\u1EA1t \u0111\u1ED9ng v\u0103n h\xF3a, t\u0103ng tr\u1EA3i nghi\u1EC7m cho ng\u01B0\u1EDDi d\xE2n v\xE0 du kh\xE1ch.",
    categoryId: 1,
    categoryName: "Th\u1EDDi s\u1EF1",
    author: "Mai Tr\xE2m",
    publishedAt: "2026-05-21T22:30:00.000Z",
    viewCount: 8640,
    isFeatured: false,
    isHot: false,
    tags: ["kh\xF4ng gian c\xF4ng c\u1ED9ng", "du l\u1ECBch \u0111\xF4 th\u1ECB", "v\u0103n h\xF3a"]
  },
  {
    title: "Ng\xE0nh logistics \u0111\u1EA7u t\u01B0 kho th\xF4ng minh \u0111\u1EC3 r\xFAt ng\u1EAFn th\u1EDDi gian giao h\xE0ng",
    summary: "M\xF4 h\xECnh kho t\u1EF1 \u0111\u1ED9ng gi\xFAp t\u1ED1i \u01B0u chi ph\xED, t\u0103ng n\u0103ng l\u1EF1c x\u1EED l\xFD \u0111\u01A1n m\xF9a cao \u0111i\u1EC3m.",
    categoryId: 2,
    categoryName: "Kinh doanh",
    author: "An Nhi\xEAn",
    publishedAt: "2026-05-21T20:25:00.000Z",
    viewCount: 11290,
    isFeatured: false,
    isHot: true,
    tags: ["logistics", "kho th\xF4ng minh", "giao h\xE0ng"]
  },
  {
    title: "Trung t\xE2m d\u1EEF li\u1EC7u trong n\u01B0\u1EDBc t\u0103ng t\u1ED1c \u0111\u1EA7u t\u01B0 h\u1EA1 t\u1EA7ng \u0111i\u1EC7n to\xE1n \u0111\xE1m m\xE2y",
    summary: "Nhu c\u1EA7u l\u01B0u tr\u1EEF v\xE0 x\u1EED l\xFD d\u1EEF li\u1EC7u t\u0103ng m\u1EA1nh t\u1EEB kh\u1ED1i t\xE0i ch\xEDnh, b\xE1n l\u1EBB v\xE0 gi\xE1o d\u1EE5c.",
    categoryId: 3,
    categoryName: "C\xF4ng ngh\u1EC7",
    author: "\u0110\xECnh L\xE2m",
    publishedAt: "2026-05-21T19:40:00.000Z",
    viewCount: 9870,
    isFeatured: false,
    isHot: false,
    tags: ["cloud", "data center", "h\u1EA1 t\u1EA7ng s\u1ED1"]
  },
  {
    title: "Bi\u1EBFn \u0111\u1ED9ng gi\xE1 n\u0103ng l\u01B0\u1EE3ng to\xE0n c\u1EA7u t\xE1c \u0111\u1ED9ng chu\u1ED7i cung \u1EE9ng",
    summary: "Nhi\u1EC1u doanh nghi\u1EC7p s\u1EA3n xu\u1EA5t ph\u1EA3i t\xE1i c\u1EA5u tr\xFAc k\u1EBF ho\u1EA1ch nh\u1EADp nguy\xEAn li\u1EC7u \u0111\u1EC3 \u1ED5n \u0111\u1ECBnh bi\xEAn l\u1EE3i nhu\u1EADn.",
    categoryId: 4,
    categoryName: "Th\u1EBF gi\u1EDBi",
    author: "Trung D\u0169ng",
    publishedAt: "2026-05-21T18:20:00.000Z",
    viewCount: 10310,
    isFeatured: false,
    isHot: true,
    tags: ["n\u0103ng l\u01B0\u1EE3ng", "chu\u1ED7i cung \u1EE9ng", "s\u1EA3n xu\u1EA5t"]
  },
  {
    title: "C\xE2u l\u1EA1c b\u1ED9 h\xE0ng \u0111\u1EA7u c\xF4ng b\u1ED1 chi\u1EBFn l\u01B0\u1EE3c tr\u1EBB h\xF3a \u0111\u1ED9i h\xECnh",
    summary: "Ban l\xE3nh \u0111\u1EA1o \u0111\u1EB7t m\u1EE5c ti\xEAu ph\xE1t tri\u1EC3n b\u1EC1n v\u1EEFng b\u1EB1ng h\u1ECDc vi\u1EC7n \u0111\xE0o t\u1EA1o n\u1ED9i b\u1ED9.",
    categoryId: 5,
    categoryName: "Th\u1EC3 thao",
    author: "Vi\u1EC7t Anh",
    publishedAt: "2026-05-21T16:55:00.000Z",
    viewCount: 11880,
    isFeatured: false,
    isHot: false,
    tags: ["c\xE2u l\u1EA1c b\u1ED9", "\u0111\xE0o t\u1EA1o tr\u1EBB", "b\xF3ng \u0111\xE1"]
  },
  {
    title: "Lo\u1EA1t phim l\u1ECBch s\u1EED t\u1EA1o hi\u1EC7u \u1EE9ng t\xEDch c\u1EF1c v\u1EDBi kh\xE1n gi\u1EA3 tr\u1EBB",
    summary: "C\xE1ch k\u1EC3 chuy\u1EC7n hi\u1EC7n \u0111\u1EA1i gi\xFAp n\u1ED9i dung l\u1ECBch s\u1EED tr\u1EDF n\xEAn g\u1EA7n g\u0169i, d\u1EC5 ti\u1EBFp c\u1EADn h\u01A1n.",
    categoryId: 6,
    categoryName: "Gi\u1EA3i tr\xED",
    author: "Thu Trang",
    publishedAt: "2026-05-21T15:15:00.000Z",
    viewCount: 9050,
    isFeatured: false,
    isHot: false,
    tags: ["phim l\u1ECBch s\u1EED", "kh\xE1n gi\u1EA3 tr\u1EBB", "n\u1ED9i dung s\u1ED1"]
  },
  {
    title: "Dinh d\u01B0\u1EE1ng h\u1ECDc \u0111\u01B0\u1EDDng \u0111\u01B0\u1EE3c t\u0103ng c\u01B0\u1EDDng b\u1EB1ng th\u1EF1c \u0111\u01A1n c\xE1 nh\xE2n h\xF3a",
    summary: "M\u1ED9t s\u1ED1 tr\u01B0\u1EDDng th\u1EED nghi\u1EC7m \u1EE9ng d\u1EE5ng theo d\xF5i kh\u1EA9u ph\u1EA7n nh\u1EB1m gi\u1EA3m t\xECnh tr\u1EA1ng th\u1EEBa c\xE2n.",
    categoryId: 7,
    categoryName: "S\u1EE9c kh\u1ECFe",
    author: "Ho\xE0ng V\u0169",
    publishedAt: "2026-05-21T13:45:00.000Z",
    viewCount: 7420,
    isFeatured: false,
    isHot: false,
    tags: ["dinh d\u01B0\u1EE1ng", "h\u1ECDc \u0111\u01B0\u1EDDng", "tr\u1EBB em"]
  },
  {
    title: "B\u1ED9 \u0111\u1EC1 \xF4n t\u1EADp tr\u1EF1c tuy\u1EBFn mi\u1EC5n ph\xED h\u1ED7 tr\u1EE3 h\u1ECDc sinh cu\u1ED1i c\u1EA5p",
    summary: "N\u1EC1n t\u1EA3ng cung c\u1EA5p l\u1ED9 tr\xECnh h\u1ECDc theo n\u0103ng l\u1EF1c, ph\xE2n t\xEDch \u0111i\u1EC3m y\u1EBFu theo t\u1EEBng ch\u1EE7 \u0111\u1EC1.",
    categoryId: 8,
    categoryName: "Gi\xE1o d\u1EE5c",
    author: "Nh\u1EADt Minh",
    publishedAt: "2026-05-21T12:30:00.000Z",
    viewCount: 12960,
    isFeatured: true,
    isHot: true,
    tags: ["\xF4n thi", "tr\u1EF1c tuy\u1EBFn", "h\u1ECDc sinh"]
  },
  {
    title: "Nhi\u1EC1u \u0111\u1ECBa ph\u01B0\u01A1ng th\xED \u0111i\u1EC3m m\xF4 h\xECnh ch\xEDnh quy\u1EC1n s\u1ED1 m\u1ED9t c\u1EEDa",
    summary: "Ng\u01B0\u1EDDi d\xE2n c\xF3 th\u1EC3 theo d\xF5i tr\u1EA1ng th\xE1i h\u1ED3 s\u01A1 th\u1EDDi gian th\u1EF1c tr\xEAn \u1EE9ng d\u1EE5ng di \u0111\u1ED9ng.",
    categoryId: 1,
    categoryName: "Th\u1EDDi s\u1EF1",
    author: "Thu\u1EADn Thi\xEAn",
    publishedAt: "2026-05-21T11:20:00.000Z",
    viewCount: 8350,
    isFeatured: false,
    isHot: false,
    tags: ["ch\xEDnh quy\u1EC1n s\u1ED1", "m\u1ED9t c\u1EEDa", "c\u1EA3i c\xE1ch h\xE0nh ch\xEDnh"]
  },
  {
    title: "Kh\u1EDFi nghi\u1EC7p xanh thu h\xFAt v\u1ED1n \u0111\u1EA7u t\u01B0 t\u1EEB qu\u1EF9 khu v\u1EF1c",
    summary: "C\xE1c d\u1EF1 \xE1n ti\u1EBFt ki\u1EC7m n\u0103ng l\u01B0\u1EE3ng v\xE0 t\xE1i ch\u1EBF nh\u1EADn \u0111\u01B0\u1EE3c quan t\xE2m nh\u1EDD kh\u1EA3 n\u0103ng t\u0103ng tr\u01B0\u1EDFng d\xE0i h\u1EA1n.",
    categoryId: 2,
    categoryName: "Kinh doanh",
    author: "Qu\u1EF3nh H\u01B0\u01A1ng",
    publishedAt: "2026-05-21T10:25:00.000Z",
    viewCount: 9675,
    isFeatured: false,
    isHot: true,
    tags: ["kh\u1EDFi nghi\u1EC7p", "\u0111\u1EA7u t\u01B0", "n\u0103ng l\u01B0\u1EE3ng s\u1EA1ch"]
  },
  {
    title: "\u1EE8ng d\u1EE5ng b\u1EA3n \u0111\u1ED3 s\u1ED1 c\u1EA3i thi\u1EC7n tr\u1EA3i nghi\u1EC7m giao th\xF4ng gi\u1EDD cao \u0111i\u1EC3m",
    summary: "Thu\u1EADt to\xE1n d\u1EF1 b\xE1o l\u01B0u l\u01B0\u1EE3ng gi\xFAp g\u1EE3i \xFD l\u1ED9 tr\xECnh t\u1ED1i \u01B0u theo th\u1EDDi gian th\u1EF1c.",
    categoryId: 3,
    categoryName: "C\xF4ng ngh\u1EC7",
    author: "Tr\u01B0\u1EDDng An",
    publishedAt: "2026-05-21T09:35:00.000Z",
    viewCount: 10620,
    isFeatured: false,
    isHot: false,
    tags: ["b\u1EA3n \u0111\u1ED3 s\u1ED1", "giao th\xF4ng", "thu\u1EADt to\xE1n"]
  },
  {
    title: "Du l\u1ECBch qu\u1ED1c t\u1EBF ph\u1EE5c h\u1ED3i, nhi\u1EC1u h\xE3ng bay m\u1EDF l\u1EA1i \u0111\u01B0\u1EDDng bay th\u1EB3ng",
    summary: "Nhu c\u1EA7u \u0111i l\u1EA1i t\u0103ng m\u1EA1nh trong m\xF9a h\xE8 k\xE9o theo gi\xE1 d\u1ECBch v\u1EE5 l\u01B0u tr\xFA bi\u1EBFn \u0111\u1ED9ng.",
    categoryId: 4,
    categoryName: "Th\u1EBF gi\u1EDBi",
    author: "Kim Oanh",
    publishedAt: "2026-05-21T08:10:00.000Z",
    viewCount: 9910,
    isFeatured: false,
    isHot: false,
    tags: ["du l\u1ECBch", "h\xE3ng bay", "m\xF9a h\xE8"]
  },
  {
    title: "Gi\u1EA3i \u0111\u1EA5u eSports h\u1ECDc \u0111\u01B0\u1EDDng t\u1EA1o s\xE2n ch\u01A1i k\u1EF9 n\u0103ng chi\u1EBFn thu\u1EADt",
    summary: "S\u1EF1 ki\u1EC7n k\u1EBFt h\u1EE3p \u0111\u1ECBnh h\u01B0\u1EDBng ngh\u1EC1 nghi\u1EC7p cho h\u1ECDc sinh y\xEAu th\xEDch l\u0129nh v\u1EF1c game v\xE0 c\xF4ng ngh\u1EC7.",
    categoryId: 5,
    categoryName: "Th\u1EC3 thao",
    author: "Thanh T\xF9ng",
    publishedAt: "2026-05-21T07:05:00.000Z",
    viewCount: 11320,
    isFeatured: false,
    isHot: true,
    tags: ["eSports", "h\u1ECDc \u0111\u01B0\u1EDDng", "chi\u1EBFn thu\u1EADt"]
  },
  {
    title: "Ngh\u1EC7 s\u0129 tr\u1EBB t\u1EA1o xu h\u01B0\u1EDBng v\u1EDBi live show k\u1EBFt h\u1EE3p c\xF4ng ngh\u1EC7 th\u1ECB gi\xE1c",
    summary: "Kh\xF4ng gian tr\xECnh di\u1EC5n nh\u1EADp vai \u0111\u01B0a kh\xE1n gi\u1EA3 v\xE0o h\xE0nh tr\xECnh \xE2m nh\u1EA1c \u0111a gi\xE1c quan.",
    categoryId: 6,
    categoryName: "Gi\u1EA3i tr\xED",
    author: "B\xEDch Ng\xE2n",
    publishedAt: "2026-05-20T22:50:00.000Z",
    viewCount: 9450,
    isFeatured: false,
    isHot: false,
    tags: ["live show", "th\u1ECB gi\xE1c", "ngh\u1EC7 s\u0129 tr\u1EBB"]
  },
  {
    title: "B\xE0i t\u1EADp ng\u1EAFn gi\u1EEFa gi\u1EDD gi\xFAp d\xE2n v\u0103n ph\xF2ng gi\u1EA3m c\u0103ng th\u1EB3ng",
    summary: "Chuy\xEAn gia khuy\u1EBFn ngh\u1ECB duy tr\xEC v\u1EADn \u0111\u1ED9ng nh\u1EB9 5 ph\xFAt m\u1ED7i gi\u1EDD \u0111\u1EC3 c\u1EA3i thi\u1EC7n tu\u1EA7n ho\xE0n.",
    categoryId: 7,
    categoryName: "S\u1EE9c kh\u1ECFe",
    author: "H\xE0 Chi",
    publishedAt: "2026-05-20T21:25:00.000Z",
    viewCount: 7210,
    isFeatured: false,
    isHot: false,
    tags: ["v\u0103n ph\xF2ng", "v\u1EADn \u0111\u1ED9ng", "gi\u1EA3m stress"]
  },
  {
    title: "Tr\u01B0\u1EDDng ph\u1ED5 th\xF4ng tri\u1EC3n khai th\u01B0 vi\u1EC7n s\u1ED1 cho h\u1ECDc sinh v\xF9ng xa",
    summary: "S\xE1ng ki\u1EBFn gi\xFAp h\u1ECDc sinh ti\u1EBFp c\u1EADn t\xE0i li\u1EC7u h\u1ECDc t\u1EADp ch\u1EA5t l\u01B0\u1EE3ng th\xF4ng qua thi\u1EBFt b\u1ECB di \u0111\u1ED9ng.",
    categoryId: 8,
    categoryName: "Gi\xE1o d\u1EE5c",
    author: "L\xE2m Anh",
    publishedAt: "2026-05-20T20:10:00.000Z",
    viewCount: 8705,
    isFeatured: false,
    isHot: true,
    tags: ["th\u01B0 vi\u1EC7n s\u1ED1", "v\xF9ng xa", "chuy\u1EC3n \u0111\u1ED5i gi\xE1o d\u1EE5c"]
  }
];
const buildContent = (item) => {
  return `
    <h2>${item.title}</h2>
    <p>${item.summary}</p>
    <p>${item.categoryName} \u0111ang ghi nh\u1EADn nhi\u1EC1u thay \u0111\u1ED5i quan tr\u1ECDng trong b\u1ED1i c\u1EA3nh th\u1ECB tr\u01B0\u1EDDng v\xE0 h\xE0nh vi ng\u01B0\u1EDDi d\xF9ng d\u1ECBch chuy\u1EC3n nhanh.</p>
    <h3>\u0110i\u1EC3m nh\u1EA5n ch\xEDnh</h3>
    <ul>
      <li>T\u1ED1c \u0111\u1ED9 c\u1EADp nh\u1EADt th\xF4ng tin ng\xE0y c\xE0ng cao nh\u1EDD c\xF4ng ngh\u1EC7 s\u1ED1.</li>
      <li>Doanh nghi\u1EC7p v\xE0 c\u01A1 quan qu\u1EA3n l\xFD \u0111\u1EA9y m\u1EA1nh t\u1ED1i \u01B0u hi\u1EC7u qu\u1EA3 v\u1EADn h\xE0nh.</li>
      <li>Ng\u01B0\u1EDDi d\xF9ng \u01B0u ti\xEAn n\u1ED9i dung ng\u1EAFn g\u1ECDn, \u0111\xE1ng tin c\u1EADy v\xE0 c\xF3 t\xEDnh \u1EE9ng d\u1EE5ng.</li>
    </ul>
    <p>Chuy\xEAn gia nh\u1EADn \u0111\u1ECBnh xu h\u01B0\u1EDBng n\xE0y s\u1EBD ti\u1EBFp t\u1EE5c trong c\xE1c qu\xFD t\u1EDBi, \u0111\u1EB7c bi\u1EC7t \u1EDF nh\xF3m l\u0129nh v\u1EF1c g\u1EAFn v\u1EDBi chuy\u1EC3n \u0111\u1ED5i s\u1ED1 v\xE0 nhu c\u1EA7u ti\xEAu d\xF9ng m\u1EDBi.</p>
  `;
};
const news = newsSeeds.map((item, index) => {
  const slug = toSlug(item.title);
  const id = index + 1;
  return {
    id,
    title: item.title,
    slug,
    summary: item.summary,
    content: buildContent(item),
    thumbnail: `https://picsum.photos/seed/vietnews-${id}/960/540`,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    author: item.author,
    publishedAt: item.publishedAt,
    viewCount: item.viewCount,
    isFeatured: item.isFeatured,
    isHot: item.isHot,
    tags: item.tags,
    seoTitle: `${item.title} | VietNews 24h`,
    seoDescription: item.summary,
    seoKeywords: [...item.tags, item.categoryName, "tin t\u1EE9c", "vietnews 24h"].join(", ")
  };
});
const CONTROL_CHAR_PATTERN = /[\u0000-\u001F\u007F]/g;
const sanitizeText = (value = "", maxLength = 320) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(CONTROL_CHAR_PATTERN, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
};
const toSafeInteger = (value, fallback = 0) => {
  const normalized = Number(value);
  if (Number.isNaN(normalized) || normalized < 0) {
    return fallback;
  }
  return Math.floor(normalized);
};
const toSafeBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
  }
  return fallback;
};
const toSafeIsoDate = (value, fallback = "") => {
  const rawValue = typeof value === "string" || value instanceof Date ? value : "";
  const date = new Date(rawValue);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }
  return date.toISOString();
};
const toSafeImage = (value = "") => {
  const normalized = sanitizeText(value, 500);
  if (!normalized) {
    return appConfig.fallbackImage;
  }
  try {
    const resolved = new URL(normalized, appConfig.appUrl);
    if (!["http:", "https:"].includes(resolved.protocol)) {
      return appConfig.fallbackImage;
    }
    return resolved.toString();
  } catch {
    return appConfig.fallbackImage;
  }
};
const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) {
    return [];
  }
  const unique = /* @__PURE__ */ new Set();
  const result = [];
  tags.forEach((tag) => {
    const safeTag = sanitizeText(tag, 40);
    if (!safeTag) {
      return;
    }
    const normalizedKey = safeTag.toLowerCase();
    if (unique.has(normalizedKey)) {
      return;
    }
    unique.add(normalizedKey);
    result.push(safeTag);
  });
  return result.slice(0, 20);
};
const buildCategoryLookup = (categories2 = []) => {
  const mapById = /* @__PURE__ */ new Map();
  const mapBySlug = /* @__PURE__ */ new Map();
  categories2.forEach((item) => {
    const safeId = toSafeInteger(item == null ? void 0 : item.id, 0);
    const safeSlug = normalizeSlug((item == null ? void 0 : item.slug) || (item == null ? void 0 : item.name));
    if (safeId > 0) {
      mapById.set(safeId, item);
    }
    if (safeSlug) {
      mapBySlug.set(safeSlug, item);
    }
  });
  return {
    mapById,
    mapBySlug
  };
};
const resolveCategory = (item, lookup) => {
  const safeCategoryId = toSafeInteger(item == null ? void 0 : item.categoryId, 0);
  const safeCategorySlug = normalizeSlug((item == null ? void 0 : item.categorySlug) || (item == null ? void 0 : item.categoryName) || "");
  const byId = safeCategoryId > 0 ? lookup.mapById.get(safeCategoryId) : null;
  const bySlug = safeCategorySlug ? lookup.mapBySlug.get(safeCategorySlug) : null;
  const matched = byId || bySlug || null;
  if (matched) {
    return {
      categoryId: toSafeInteger(matched.id, safeCategoryId),
      categoryName: sanitizeText(matched.name, 80),
      categorySlug: normalizeSlug(matched.slug || matched.name)
    };
  }
  const categoryName = sanitizeText((item == null ? void 0 : item.categoryName) || "Tin t\u1EE9c", 80) || "Tin t\u1EE9c";
  const categorySlug = normalizeSlug((item == null ? void 0 : item.categorySlug) || categoryName);
  return {
    categoryId: safeCategoryId,
    categoryName,
    categorySlug
  };
};
const normalizeNewsItem = (item, options = {}) => {
  const {
    categories: categories2 = [],
    fallbackId = 0,
    categoryLookup = null
  } = options;
  if (!item || typeof item !== "object") {
    return null;
  }
  const lookup = categoryLookup || buildCategoryLookup(categories2);
  const id = toSafeInteger(item.id, fallbackId || 0) || fallbackId || 0;
  const title = sanitizeText(item.title, 180);
  if (!title) {
    return null;
  }
  const slug = normalizeSlug(item.slug || generateSlug(title)) || `tin-${id || fallbackId || Date.now()}`;
  const summary = sanitizeText(item.summary || item.description || "", 320);
  const rawContent = typeof item.content === "string" ? item.content.trim() : "";
  const content = rawContent || (summary ? `<p>${summary}</p>` : "");
  const publishedAt = toSafeIsoDate(item.publishedAt, "");
  const updatedAt = toSafeIsoDate(item.updatedAt, publishedAt);
  const viewCount = toSafeInteger(item.viewCount, 0);
  const author = sanitizeText(item.author || "Ban bi\xEAn t\u1EADp", 80) || "Ban bi\xEAn t\u1EADp";
  const tags = normalizeTags(item.tags);
  const categoryInfo = resolveCategory(item, lookup);
  const seoTitle = sanitizeText(item.seoTitle || `${title} | VietNews 24h`, 180);
  const seoDescription = sanitizeText(item.seoDescription || summary, 320);
  const seoKeywords = sanitizeText(item.seoKeywords || tags.join(", "), 320);
  return {
    id,
    title,
    slug,
    summary,
    content,
    thumbnail: toSafeImage(item.thumbnail),
    categoryId: categoryInfo.categoryId,
    categoryName: categoryInfo.categoryName,
    categorySlug: categoryInfo.categorySlug,
    author,
    publishedAt,
    updatedAt,
    viewCount,
    isFeatured: toSafeBoolean(item.isFeatured, false),
    isHot: toSafeBoolean(item.isHot, false),
    tags,
    seoTitle,
    seoDescription,
    seoKeywords
  };
};
const normalizeNewsList = (items = [], categories2 = []) => {
  if (!Array.isArray(items)) {
    return [];
  }
  const normalized = [];
  const seenSlug = /* @__PURE__ */ new Set();
  const lookup = buildCategoryLookup(categories2);
  items.forEach((item, index) => {
    const mapped = normalizeNewsItem(item, {
      categories: categories2,
      fallbackId: index + 1,
      categoryLookup: lookup
    });
    if (!mapped || seenSlug.has(mapped.slug)) {
      return;
    }
    seenSlug.add(mapped.slug);
    normalized.push(mapped);
  });
  return normalized;
};
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const paginate = (items = [], page = 1, pageSize = appConfig.defaultPageSize) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safePageSize = Math.max(Number(pageSize) || appConfig.defaultPageSize, 1);
  const totalItems = items.length;
  const totalPages = Math.max(Math.ceil(totalItems / safePageSize), 1);
  const currentPage = Math.min(safePage, totalPages);
  const start = (currentPage - 1) * safePageSize;
  return {
    items: items.slice(start, start + safePageSize),
    pagination: {
      page: currentPage,
      pageSize: safePageSize,
      totalItems,
      totalPages
    }
  };
};
const extractListResponse = (payload) => {
  if (Array.isArray(payload)) {
    return {
      hasValidShape: true,
      items: payload
    };
  }
  if (Array.isArray(payload == null ? void 0 : payload.items)) {
    return {
      hasValidShape: true,
      items: payload.items
    };
  }
  if (Array.isArray(payload == null ? void 0 : payload.data)) {
    return {
      hasValidShape: true,
      items: payload.data
    };
  }
  return {
    hasValidShape: false,
    items: []
  };
};
const normalizedCategories = normalizeCategoryList(categories);
const normalizedMockNews = normalizeNewsList(news, normalizedCategories);
const getSortedMockNews = () => sortByPublishedAtDesc(normalizedMockNews);
const getCategoriesFallback = () => {
  return appConfig.allowMockFallback ? [...normalizedCategories] : [];
};
const getNewsFallback = () => {
  return appConfig.allowMockFallback ? getSortedMockNews() : [];
};
const categoryCache = {
  items: [...normalizedCategories],
  expiresAt: 0,
  pending: null
};
const newsCache = {
  items: [],
  expiresAt: 0,
  pending: null
};
const getCacheTtl = () => Math.max(Number(appConfig.newsCacheTtlMs || 0), 0);
const isCacheAvailable = () => {
  return Array.isArray(newsCache.items) && newsCache.items.length > 0 && Date.now() < newsCache.expiresAt;
};
const saveNewsCache = (items) => {
  newsCache.items = Array.isArray(items) ? [...items] : [];
  newsCache.expiresAt = Date.now() + getCacheTtl();
};
const clearNewsCache = () => {
  newsCache.items = [];
  newsCache.expiresAt = 0;
  newsCache.pending = null;
};
const isCategoryCacheAvailable = () => {
  return Array.isArray(categoryCache.items) && categoryCache.items.length > 0 && Date.now() < categoryCache.expiresAt;
};
const saveCategoryCache = (items) => {
  categoryCache.items = Array.isArray(items) ? [...items] : getCategoriesFallback();
  categoryCache.expiresAt = Date.now() + getCacheTtl();
};
const getAvailableCategories = async () => {
  if (appConfig.useMockApi) {
    return [...normalizedCategories];
  }
  if (isCategoryCacheAvailable()) {
    return [...categoryCache.items];
  }
  if (categoryCache.pending) {
    return categoryCache.pending;
  }
  categoryCache.pending = (async () => {
    try {
      const categories2 = await categoryService.getCategories();
      if (Array.isArray(categories2) && categories2.length > 0) {
        saveCategoryCache(categories2);
        return [...categories2];
      }
    } catch (error) {
    } finally {
      categoryCache.pending = null;
    }
    const fallbackCategories = getCategoriesFallback();
    saveCategoryCache(fallbackCategories);
    return fallbackCategories;
  })();
  return categoryCache.pending;
};
const getAllNews = async () => {
  if (isCacheAvailable()) {
    return [...newsCache.items];
  }
  if (newsCache.pending) {
    return newsCache.pending;
  }
  newsCache.pending = (async () => {
    if (appConfig.useMockApi) {
      await delay();
      const mockNews = getSortedMockNews();
      saveNewsCache(mockNews);
      return mockNews;
    }
    try {
      const response = await apiClient.get("/news");
      const { hasValidShape, items } = extractListResponse(response.data);
      const availableCategories = await getAvailableCategories();
      if (!hasValidShape) {
        const fallbackNews = getNewsFallback();
        saveNewsCache(fallbackNews);
        return fallbackNews;
      }
      const normalizedNews = normalizeNewsList(items, availableCategories);
      if (items.length > 0 && normalizedNews.length === 0) {
        const fallbackNews = getNewsFallback();
        saveNewsCache(fallbackNews);
        return fallbackNews;
      }
      const sortedNews = sortByPublishedAtDesc(normalizedNews);
      saveNewsCache(sortedNews);
      return sortedNews;
    } catch (error) {
      const fallbackNews = getNewsFallback();
      saveNewsCache(fallbackNews);
      return fallbackNews;
    } finally {
      newsCache.pending = null;
    }
  })();
  return newsCache.pending;
};
const getCategoryBySlug = (slug) => {
  const safeSlug = normalizeSlug(slug);
  return categoryCache.items.find((item) => item.slug === safeSlug) || null;
};
const newsService = {
  clearCache() {
    clearNewsCache();
    categoryCache.expiresAt = 0;
    categoryCache.pending = null;
  },
  async getNewsList(page = 1, pageSize = appConfig.defaultPageSize) {
    const allNews = await getAllNews();
    const paginated = paginate(allNews, page, pageSize);
    const sidebarItems = [...allNews].sort((a, b) => b.viewCount - a.viewCount).slice(0, 6);
    return {
      items: paginated.items,
      pagination: paginated.pagination,
      sidebarItems
    };
  },
  async getHomeNewsData() {
    const allNews = await getAllNews();
    const featured = allNews.filter((item) => item.isFeatured).slice(0, 4);
    const latest = allNews.slice(0, 12);
    const popular = [...allNews].sort((a, b) => b.viewCount - a.viewCount).slice(0, 8);
    const hot = allNews.filter((item) => item.isHot).slice(0, 8);
    const categorySections = normalizedCategories.map((category) => ({
      category,
      items: allNews.filter((item) => item.categoryId === category.id).slice(0, 4)
    }));
    return {
      featured,
      latest,
      popular,
      hot,
      categorySections,
      sidebar: {
        topReads: popular.slice(0, 5),
        hotPicks: hot.slice(0, 5)
      }
    };
  },
  async getNewsByCategorySlug(slug, page = 1, pageSize = appConfig.defaultPageSize) {
    const allNews = await getAllNews();
    const category = getCategoryBySlug(slug);
    if (!category) {
      return {
        category: null,
        items: [],
        pagination: {
          page: 1,
          pageSize,
          totalItems: 0,
          totalPages: 1
        }
      };
    }
    const filtered = allNews.filter((item) => item.categoryId === category.id);
    const paginated = paginate(filtered, page, pageSize);
    const sidebarItems = [...filtered].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
    return {
      category,
      items: paginated.items,
      pagination: paginated.pagination,
      sidebarItems
    };
  },
  async getNewsDetailBySlug(slug) {
    const allNews = await getAllNews();
    const safeSlug = normalizeSlug(slug);
    return allNews.find((item) => normalizeSlug(item.slug) === safeSlug) || null;
  },
  async getRelatedNews(newsItem, limit = appConfig.relatedNewsLimit) {
    if (!newsItem) {
      return [];
    }
    const allNews = await getAllNews();
    return allNews.filter((item) => item.id !== newsItem.id && item.categoryId === newsItem.categoryId).slice(0, limit);
  },
  async searchNews(query, page = 1, pageSize = appConfig.defaultPageSize) {
    const allNews = await getAllNews();
    const rawKeyword = normalizeSearchInput(query);
    const keyword = rawKeyword.toLowerCase();
    if (!rawKeyword) {
      return {
        query: "",
        items: [],
        pagination: {
          page: 1,
          pageSize,
          totalItems: 0,
          totalPages: 1
        }
      };
    }
    const filtered = allNews.filter((item) => {
      return item.title.toLowerCase().includes(keyword) || item.summary.toLowerCase().includes(keyword) || item.tags.some((tag) => tag.toLowerCase().includes(keyword));
    });
    const paginated = paginate(filtered, page, pageSize);
    return {
      query: rawKeyword,
      items: paginated.items,
      pagination: paginated.pagination
    };
  }
};
const useNewsStore = defineStore("news", {
  state: () => ({
    homeData: {
      featured: [],
      latest: [],
      popular: [],
      hot: [],
      categorySections: [],
      sidebar: {
        topReads: [],
        hotPicks: []
      }
    },
    categoryNews: {
      category: null,
      items: [],
      pagination: {
        page: 1,
        pageSize: appConfig.defaultPageSize,
        totalItems: 0,
        totalPages: 1
      },
      sidebarItems: []
    },
    newsList: {
      items: [],
      pagination: {
        page: 1,
        pageSize: appConfig.defaultPageSize,
        totalItems: 0,
        totalPages: 1
      },
      sidebarItems: []
    },
    newsDetail: null,
    relatedNews: [],
    searchResult: {
      query: "",
      items: [],
      pagination: {
        page: 1,
        pageSize: appConfig.defaultPageSize,
        totalItems: 0,
        totalPages: 1
      }
    },
    loading: {
      home: false,
      category: false,
      list: false,
      detail: false,
      search: false
    },
    error: {
      home: "",
      category: "",
      list: "",
      detail: "",
      search: ""
    },
    cacheKeys: {
      homeLoaded: false,
      category: "",
      list: "",
      search: ""
    }
  }),
  actions: {
    async fetchHomeNews(forceReload = false) {
      if (this.loading.home) {
        return;
      }
      if (!forceReload && this.cacheKeys.homeLoaded) {
        return;
      }
      this.loading.home = true;
      this.error.home = "";
      try {
        this.homeData = await newsService.getHomeNewsData();
        this.cacheKeys.homeLoaded = true;
      } catch (error) {
        this.error.home = getSafeErrorMessage(error, "errors.fallback.homeLoad");
      } finally {
        this.loading.home = false;
      }
    },
    async fetchCategoryNews(slug, page = 1, forceReload = false) {
      if (this.loading.category) {
        return;
      }
      const requestKey = `${String(slug || "")}|${Number(page || 1)}|${this.categoryNews.pagination.pageSize}`;
      if (!forceReload && this.cacheKeys.category === requestKey && this.categoryNews.items.length > 0) {
        return;
      }
      this.loading.category = true;
      this.error.category = "";
      try {
        this.categoryNews = await newsService.getNewsByCategorySlug(
          slug,
          page,
          this.categoryNews.pagination.pageSize
        );
        this.cacheKeys.category = requestKey;
      } catch (error) {
        this.error.category = getSafeErrorMessage(
          error,
          "errors.fallback.categoryNewsLoad"
        );
        this.categoryNews.items = [];
      } finally {
        this.loading.category = false;
      }
    },
    async fetchNewsList(page = 1, forceReload = false) {
      if (this.loading.list) {
        return;
      }
      const requestKey = `${Number(page || 1)}|${this.newsList.pagination.pageSize}`;
      if (!forceReload && this.cacheKeys.list === requestKey && this.newsList.items.length > 0) {
        return;
      }
      this.loading.list = true;
      this.error.list = "";
      try {
        this.newsList = await newsService.getNewsList(page, this.newsList.pagination.pageSize);
        this.cacheKeys.list = requestKey;
      } catch (error) {
        this.error.list = getSafeErrorMessage(error, "errors.fallback.newsListLoad");
        this.newsList.items = [];
      } finally {
        this.loading.list = false;
      }
    },
    async fetchNewsDetail(slug) {
      this.loading.detail = true;
      this.error.detail = "";
      this.newsDetail = null;
      this.relatedNews = [];
      try {
        this.newsDetail = await newsService.getNewsDetailBySlug(slug);
        if (this.newsDetail) {
          this.relatedNews = await newsService.getRelatedNews(this.newsDetail);
        }
      } catch (error) {
        this.error.detail = getSafeErrorMessage(error, "errors.fallback.newsDetailLoad");
      } finally {
        this.loading.detail = false;
      }
      return this.newsDetail;
    },
    async searchNews(query, page = 1, forceReload = false) {
      if (this.loading.search) {
        return;
      }
      this.loading.search = true;
      this.error.search = "";
      const safeQuery = normalizeSearchInput(query);
      const requestKey = `${safeQuery}|${Number(page || 1)}|${this.searchResult.pagination.pageSize}`;
      try {
        if (!forceReload && this.cacheKeys.search === requestKey && this.searchResult.query === safeQuery) {
          return;
        }
        if (!safeQuery) {
          this.searchResult = {
            query: "",
            items: [],
            pagination: {
              page: 1,
              pageSize: this.searchResult.pagination.pageSize,
              totalItems: 0,
              totalPages: 1
            }
          };
          this.cacheKeys.search = "";
          return;
        }
        this.searchResult = await newsService.searchNews(
          safeQuery,
          page,
          this.searchResult.pagination.pageSize
        );
        this.cacheKeys.search = requestKey;
      } catch (error) {
        this.error.search = getSafeErrorMessage(error, "errors.fallback.searchLoad");
      } finally {
        this.loading.search = false;
      }
    },
    clearNewsDetail() {
      this.newsDetail = null;
      this.relatedNews = [];
      this.error.detail = "";
    }
  }
});

export { _sfc_main as _, _sfc_main$1 as a, _sfc_main$2 as b, formatDate as f, useNewsStore as u };
//# sourceMappingURL=useNewsStore-DMAV_6AT.mjs.map
