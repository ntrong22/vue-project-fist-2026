import { computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { useI18n } from 'vue-i18n';

const _sfc_main = {
  __name: "Pagination",
  __ssrInlineRender: true,
  props: {
    page: {
      type: Number,
      default: 1
    },
    totalPages: {
      type: Number,
      default: 1
    },
    maxVisible: {
      type: Number,
      default: 7
    }
  },
  emits: ["update:page", "change"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { t } = useI18n({ useScope: "global" });
    const visiblePages = computed(() => {
      if (props.totalPages <= props.maxVisible) {
        return Array.from({ length: props.totalPages }, (_, index) => index + 1);
      }
      const pages = [1];
      const side = 2;
      const start = Math.max(2, props.page - side);
      const end = Math.min(props.totalPages - 1, props.page + side);
      if (start > 2) {
        pages.push("...");
      }
      for (let i = start; i <= end; i += 1) {
        pages.push(i);
      }
      if (end < props.totalPages - 1) {
        pages.push("...");
      }
      pages.push(props.totalPages);
      return pages;
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.totalPages > 1) {
        _push(`<nav${ssrRenderAttrs(mergeProps({
          class: "mt-8 flex items-center justify-center gap-2",
          "aria-label": "Pagination"
        }, _attrs))}><button type="button" class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-400 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"${ssrIncludeBooleanAttr(__props.page <= 1) ? " disabled" : ""}>${ssrInterpolate(unref(t)("common.previous"))}</button><!--[-->`);
        ssrRenderList(visiblePages.value, (item) => {
          _push(`<button type="button"${ssrIncludeBooleanAttr(item === "...") ? " disabled" : ""} class="${ssrRenderClass([[
            item === __props.page ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 text-slate-700 hover:border-brand-400 hover:text-brand-700",
            item === "..." ? "cursor-default border-transparent text-slate-400 hover:border-transparent hover:text-slate-400" : ""
          ], "min-w-10 rounded-lg border px-3 py-2 text-sm transition"])}">${ssrInterpolate(item)}</button>`);
        });
        _push(`<!--]--><button type="button" class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-400 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"${ssrIncludeBooleanAttr(__props.page >= __props.totalPages) ? " disabled" : ""}>${ssrInterpolate(unref(t)("common.next"))}</button></nav>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/common/Pagination.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Pagination-DMNsGDjT.mjs.map
