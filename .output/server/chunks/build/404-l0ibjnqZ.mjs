import { ssrRenderComponent } from 'vue/server-renderer';
import { _ as _sfc_main$1 } from './NotFoundView-DPbeZt6c.mjs';
import { s as setResponseStatus } from './server.mjs';
import { useSSRContext } from 'vue';
import 'vue-i18n';
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

const _sfc_main = {
  __name: "404",
  __ssrInlineRender: true,
  setup(__props) {
    setResponseStatus(404);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$1, _attrs, null, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/404.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=404-l0ibjnqZ.mjs.map
