import { a as __nuxt_component_0$1 } from './server.mjs';
import { mergeProps, withCtx, unref, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { useI18n } from 'vue-i18n';

const _sfc_main = {
  __name: "Breadcrumb",
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
      _push(`<nav${ssrRenderAttrs(mergeProps({
        "aria-label": "Breadcrumb",
        class: "mb-5 text-sm"
      }, _attrs))}><ol class="flex flex-wrap items-center gap-2 text-slate-500"><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "hover:text-brand-700"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("nav.home"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("nav.home")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><!--[-->`);
      ssrRenderList(__props.items, (item) => {
        _push(`<li class="flex items-center gap-2"><span aria-hidden="true">/</span>`);
        if (item.to) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: item.to,
            class: "hover:text-brand-700"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(item.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(item.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        } else {
          _push(`<span class="font-medium text-slate-700" aria-current="page">${ssrInterpolate(item.label)}</span>`);
        }
        _push(`</li>`);
      });
      _push(`<!--]--></ol></nav>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/common/Breadcrumb.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Breadcrumb-DcrKZ2Ot.mjs.map
