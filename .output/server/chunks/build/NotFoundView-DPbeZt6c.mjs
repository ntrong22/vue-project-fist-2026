import { a as __nuxt_component_0$1, j as updateSeoMeta, f as buildAlternateLocaleLinks, e as buildLocalizedCanonicalUrl } from './server.mjs';
import { watch, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { useI18n } from 'vue-i18n';

const _sfc_main = {
  __name: "NotFoundView",
  __ssrInlineRender: true,
  setup(__props) {
    const { t, locale } = useI18n({ useScope: "global" });
    const applySeo = () => {
      updateSeoMeta({
        title: t("seo.notFound.title"),
        description: t("seo.notFound.description"),
        keywords: t("seo.notFound.keywords"),
        canonical: buildLocalizedCanonicalUrl("/404", locale.value),
        robots: "noindex, nofollow",
        locale: locale.value,
        alternates: buildAlternateLocaleLinks("/404")
      });
    };
    applySeo();
    watch(
      () => locale.value,
      () => applySeo()
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "container-wide pt-10" }, _attrs))}><article class="card-surface p-8 text-center lg:p-12"><p class="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-700">404</p><h1 class="mb-3 text-3xl font-bold text-slate-900">${ssrInterpolate(unref(t)("notFoundPage.title"))}</h1><p class="mx-auto mb-6 max-w-xl text-slate-600">${ssrInterpolate(unref(t)("notFoundPage.description"))}</p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("common.goHome"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("common.goHome")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</article></section>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/NotFoundView.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=NotFoundView-DPbeZt6c.mjs.map
