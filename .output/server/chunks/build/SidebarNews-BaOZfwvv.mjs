import { a as __nuxt_component_0$1, b as buildNewsPath, g as getLocalizedContent, c as appConfig } from './server.mjs';
import { computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent, ssrRenderAttr } from 'vue/server-renderer';
import { useI18n } from 'vue-i18n';

const _sfc_main = {
  __name: "SidebarNews",
  __ssrInlineRender: true,
  props: {
    title: {
      type: String,
      default: ""
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  setup(__props) {
    const props = __props;
    const { t, locale } = useI18n({ useScope: "global" });
    const resolvedTitle = computed(() => props.title || t("news.sidebarFeatured"));
    const getText = (item, field) => getLocalizedContent(item, field, locale.value);
    const onImageError = (event) => {
      event.target.src = appConfig.fallbackImage;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<aside${ssrRenderAttrs(mergeProps({ class: "card-surface p-4" }, _attrs))}><h3 class="mb-4 text-lg font-bold text-slate-900">${ssrInterpolate(resolvedTitle.value)}</h3><ul class="space-y-4"><!--[-->`);
      ssrRenderList(props.items, (item) => {
        _push(`<li class="flex gap-3">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(buildNewsPath)(item.slug),
          class: "h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-200"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<img${ssrRenderAttr("src", item.thumbnail)}${ssrRenderAttr("alt", getText(item, "title"))} class="h-full w-full object-cover" loading="lazy"${_scopeId}>`);
            } else {
              return [
                createVNode("img", {
                  src: item.thumbnail,
                  alt: getText(item, "title"),
                  class: "h-full w-full object-cover",
                  loading: "lazy",
                  onError: onImageError
                }, null, 40, ["src", "alt"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`<div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(buildNewsPath)(item.slug),
          class: "line-clamp-2 text-sm font-medium text-slate-800 transition hover:text-brand-700"
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
        _push(`<p class="mt-1 text-xs text-slate-500">${ssrInterpolate(getText(item, "categoryName"))}</p></div></li>`);
      });
      _push(`<!--]--></ul></aside>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/news/SidebarNews.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=SidebarNews-BaOZfwvv.mjs.map
