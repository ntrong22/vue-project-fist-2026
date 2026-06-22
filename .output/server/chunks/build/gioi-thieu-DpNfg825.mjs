import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
import { watch, mergeProps, unref, useSSRContext } from 'vue';
import { useI18n } from 'vue-i18n';
import { _ as _sfc_main$2 } from './Breadcrumb-DcrKZ2Ot.mjs';
import { j as updateSeoMeta, f as buildAlternateLocaleLinks, e as buildLocalizedCanonicalUrl } from './server.mjs';
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

const _sfc_main$1 = {
  __name: "AboutView",
  __ssrInlineRender: true,
  setup(__props) {
    const { t, locale } = useI18n({ useScope: "global" });
    const applySeo = () => {
      updateSeoMeta({
        title: t("seo.about.title"),
        description: t("seo.about.description"),
        keywords: t("seo.about.keywords"),
        canonical: buildLocalizedCanonicalUrl("/gioi-thieu", locale.value),
        locale: locale.value,
        alternates: buildAlternateLocaleLinks("/gioi-thieu")
      });
    };
    applySeo();
    watch(
      () => locale.value,
      () => applySeo()
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "container-wide pt-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$2, {
        items: [{ label: unref(t)("aboutPage.breadcrumb") }]
      }, null, _parent));
      _push(`<article class="card-surface p-6 lg:p-8"><header class="mb-6"><h1 class="mb-3 text-3xl font-bold text-slate-900">${ssrInterpolate(unref(t)("aboutPage.title"))}</h1><p class="max-w-3xl text-slate-600">${ssrInterpolate(unref(t)("aboutPage.intro"))}</p></header><div class="grid gap-6 md:grid-cols-2"><section><h2 class="mb-2 text-xl font-semibold text-slate-900">${ssrInterpolate(unref(t)("aboutPage.missionTitle"))}</h2><p class="text-slate-600">${ssrInterpolate(unref(t)("aboutPage.missionText"))}</p></section><section><h2 class="mb-2 text-xl font-semibold text-slate-900">${ssrInterpolate(unref(t)("aboutPage.valuesTitle"))}</h2><ul class="list-disc space-y-1 pl-6 text-slate-600"><li>${ssrInterpolate(unref(t)("aboutPage.value1"))}</li><li>${ssrInterpolate(unref(t)("aboutPage.value2"))}</li><li>${ssrInterpolate(unref(t)("aboutPage.value3"))}</li></ul></section></div></article></section>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/AboutView.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "gioi-thieu",
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/gioi-thieu.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=gioi-thieu-DpNfg825.mjs.map
