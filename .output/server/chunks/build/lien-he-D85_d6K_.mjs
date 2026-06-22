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
  __name: "ContactView",
  __ssrInlineRender: true,
  setup(__props) {
    const { t, locale } = useI18n({ useScope: "global" });
    const applySeo = () => {
      updateSeoMeta({
        title: t("seo.contact.title"),
        description: t("seo.contact.description"),
        keywords: t("seo.contact.keywords"),
        canonical: buildLocalizedCanonicalUrl("/lien-he", locale.value),
        locale: locale.value,
        alternates: buildAlternateLocaleLinks("/lien-he")
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
        items: [{ label: unref(t)("contactPage.breadcrumb") }]
      }, null, _parent));
      _push(`<article class="card-surface p-6 lg:p-8"><h1 class="mb-3 text-3xl font-bold text-slate-900">${ssrInterpolate(unref(t)("contactPage.title"))}</h1><p class="mb-6 text-slate-600">${ssrInterpolate(unref(t)("contactPage.intro"))}</p><div class="grid gap-6 lg:grid-cols-2"><section><h2 class="mb-3 text-xl font-semibold text-slate-900">${ssrInterpolate(unref(t)("contactPage.officeTitle"))}</h2><ul class="space-y-2 text-slate-600"><li>${ssrInterpolate(unref(t)("contactPage.address"))}</li><li>${ssrInterpolate(unref(t)("contactPage.email"))}</li><li>${ssrInterpolate(unref(t)("contactPage.hotline"))}</li><li>${ssrInterpolate(unref(t)("contactPage.workTime"))}</li></ul></section><section><h2 class="mb-3 text-xl font-semibold text-slate-900">${ssrInterpolate(unref(t)("contactPage.quickFormTitle"))}</h2><form class="space-y-3"><label class="block"><span class="mb-1 block text-sm text-slate-700">${ssrInterpolate(unref(t)("contactPage.fullNameLabel"))}</span><input type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"></label><label class="block"><span class="mb-1 block text-sm text-slate-700">${ssrInterpolate(unref(t)("contactPage.emailLabel"))}</span><input type="email" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"></label><label class="block"><span class="mb-1 block text-sm text-slate-700">${ssrInterpolate(unref(t)("contactPage.contentLabel"))}</span><textarea rows="4" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"></textarea></label><button type="submit" class="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">${ssrInterpolate(unref(t)("contactPage.submit"))}</button></form></section></div></article></section>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/ContactView.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "lien-he",
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/lien-he.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=lien-he-D85_d6K_.mjs.map
