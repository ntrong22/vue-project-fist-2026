import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { ref, computed, watch, mergeProps, unref, defineComponent, shallowRef, h, resolveComponent, hasInjectionContext, inject, getCurrentInstance, createElementBlock, provide, cloneVNode, Suspense, Fragment, useSSRContext, createApp, shallowReactive, onErrorCaptured, onServerPrefetch, createVNode, resolveDynamicComponent, reactive, effectScope, defineAsyncComponent, withCtx, getCurrentScope, toRef, toDisplayString, createTextVNode, isReadonly, toRaw, isRef, isShallow, isReactive } from 'vue';
import { l as setResponseStatus$1, p as parseQuery, m as hasProtocol, n as joinURL, o as parseURL, e as encodePath, q as decodePath, r as isScriptProtocol, w as withQuery, v as getContext, x as withTrailingSlash, y as withoutTrailingSlash, z as sanitizeStatusCode, $ as $fetch, A as createHooks, f as createError$1, B as executeAsync, C as klona, D as defu, E as parse, F as getRequestHeader, d as destr, G as isEqual, H as setCookie, I as getCookie, J as deleteCookie } from '../_/nitro.mjs';
import { u as useHead$1, h as headSymbol, b as baseURL } from '../routes/renderer.mjs';
import { defineStore, setActivePinia, createPinia, shouldHydrate } from 'pinia';
import { RouterView, useRoute as useRoute$1, useRouter as useRouter$1, createMemoryHistory, createRouter, START_LOCATION } from 'vue-router';
import DOMPurify from 'isomorphic-dompurify';
import { useI18n, createI18n } from 'vue-i18n';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderSuspense, ssrRenderComponent, ssrRenderVNode, ssrRenderSlot, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import axios from 'axios';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.21.7";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...options.ssrContext?.payload || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin2) {
  if (typeof plugin2 === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  let error = void 0;
  let promiseDepth = 0;
  async function executePlugin(plugin2) {
    const unresolvedPluginsForThisPlugin = plugin2.dependsOn?.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name)) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin2]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin2).then(async () => {
        if (plugin2._name) {
          resolvedPlugins.add(plugin2._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin2._name)) {
              dependsOn.delete(plugin2._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      }).catch((e) => {
        if (!plugin2.parallel && !nuxtApp.payload.error) {
          throw e;
        }
        error ||= e;
      });
      if (plugin2.parallel) {
        parallels.push(promise);
      } else {
        await promise;
      }
    }
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin2);
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    await executePlugin(plugin2);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (error) {
    throw nuxtApp.payload.error || error;
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  const _name = plugin2._name || plugin2.name;
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true, _name });
}
const definePayloadPlugin = defineNuxtPlugin;
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
  }
  nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const LayoutMetaSymbol = /* @__PURE__ */ Symbol("layout-meta");
const PageRouteSymbol = /* @__PURE__ */ Symbol("route");
globalThis._importMeta_.url.replace(/\/app\/.*$/, "/");
const useRouter = () => {
  return useNuxtApp()?.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const HTML_ATTR_UNSAFE_RE = /[&"'<>]/g;
const HTML_ATTR_ENCODE_MAP = {
  "&": "%26",
  '"': "%22",
  "'": "%27",
  "<": "%3C",
  ">": "%3E"
};
function encodeForHtmlAttr(value) {
  return value.replace(HTML_ATTR_UNSAFE_RE, (c) => HTML_ATTR_ENCODE_MAP[c]);
}
const navigateTo = (to, options) => {
  to ||= "/";
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = options?.external || isExternalHost;
  if (isExternal) {
    if (!options?.external) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedHeader = encodeURL(location2, isExternalHost);
        const encodedLoc = encodeForHtmlAttr(encodedHeader);
        nuxtApp.ssrContext["~renderResponse"] = {
          statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options?.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  const encodedTo = typeof to === "string" ? encodeRoutePath(to) : to;
  return options?.replace ? router.replace(encodedTo) : router.push(encodedTo);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    const pathname = url.pathname.replace(/^\/{2,}/, "/");
    return pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
function encodeRoutePath(url) {
  const parsed = parseURL(url);
  return encodePath(decodePath(parsed.pathname)) + parsed.search + parsed.hash;
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const error2 = /* @__PURE__ */ useError();
    if (false) ;
    error2.value ||= nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  if (typeof error !== "string" && error.statusText) {
    error.message ??= error.statusText;
  }
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  Object.defineProperty(nuxtError, "status", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusCode,
    configurable: true
  });
  Object.defineProperty(nuxtError, "statusText", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusMessage,
    configurable: true
  });
  return nuxtError;
};
function injectHead(nuxtApp) {
  const nuxt = nuxtApp || tryUseNuxtApp();
  return nuxt?.ssrContext?.head || nuxt?.runWithContext(() => {
    if (hasInjectionContext()) {
      return inject(headSymbol);
    }
  });
}
function useHead(input, options = {}) {
  const head = injectHead(options.nuxt);
  if (head) {
    return useHead$1(input, { head, ...options });
  }
}
const matcher = /* @__PURE__ */ (() => {
  const $0 = { prerender: true }, $1 = { prerender: false };
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    if (p === "/") {
      r.unshift({ data: $0 });
    } else if (p === "/tin-tuc") {
      r.unshift({ data: $0 });
    } else if (p === "/gioi-thieu") {
      r.unshift({ data: $0 });
    } else if (p === "/lien-he") {
      r.unshift({ data: $0 });
    } else if (p === "/tim-kiem") {
      r.unshift({ data: $1 });
    } else if (p === "/404") {
      r.unshift({ data: $1 });
    }
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "tin-tuc") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      } else if (s[1] === "danh-muc") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _routeRulesMatcher = (path) => defu({}, ...matcher("", typeof path === "string" ? path.toLowerCase() : path).map((r) => r.data).reverse());
const routeRulesMatcher = _routeRulesMatcher;
function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  try {
    return routeRulesMatcher(path.toLowerCase());
  } catch (e) {
    console.error("[nuxt] Error matching route rules.", e);
    return {};
  }
}
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext["~payloadReducers"][name] = reduce;
  }
}
const payloadPlugin = definePayloadPlugin(() => {
  definePayloadReducer(
    "skipHydrate",
    // We need to return something truthy to be treated as a match
    (data) => !shouldHydrate(data) && 1
  );
});
function freezeHead(head) {
  const realPush = head.push;
  head.push = () => ({ dispose: () => {
  }, patch: () => {
  }, _poll: () => {
  } });
  return () => {
    head.push = realPush;
  };
}
const unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    if (nuxtApp.ssrContext.islandContext) {
      const unfreeze = freezeHead(head);
      nuxtApp.hooks.hookOnce("app:created", unfreeze);
    }
    nuxtApp.vueApp.use(head);
  }
});
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
const _routes = [
  {
    name: "404",
    path: "/404",
    component: () => import('./404-l0ibjnqZ.mjs')
  },
  {
    name: "index",
    path: "/",
    component: () => import('./index-CALe08xu.mjs')
  },
  {
    name: "lien-he",
    path: "/lien-he",
    component: () => import('./lien-he-D85_d6K_.mjs')
  },
  {
    name: "tim-kiem",
    path: "/tim-kiem",
    component: () => import('./tim-kiem-DY2drvw5.mjs')
  },
  {
    name: "gioi-thieu",
    path: "/gioi-thieu",
    component: () => import('./gioi-thieu-DpNfg825.mjs')
  },
  {
    name: "tin-tuc",
    path: "/tin-tuc",
    component: () => import('./index-BD2vF-iQ.mjs')
  },
  {
    name: "pathMatch",
    path: "/:pathMatch(.*)*",
    component: () => import('./_...pathMatch_-DC-5Jo2p.mjs')
  },
  {
    name: "tin-tuc-slug",
    path: "/tin-tuc/:slug()",
    component: () => import('./_slug_-DlqJLZe7.mjs')
  },
  {
    name: "danh-muc-slug",
    path: "/danh-muc/:slug()",
    component: () => import('./_slug_-BC4SzrOy.mjs')
  }
];
const ROUTE_KEY_PARENTHESES_RE = /(:\w+)\([^)]+\)/g;
const ROUTE_KEY_SYMBOLS_RE = /(:\w+)[?+*]/g;
const ROUTE_KEY_NORMAL_RE = /:\w+/g;
function generateRouteKey(route) {
  const source = route?.meta.key ?? route.path.replace(ROUTE_KEY_PARENTHESES_RE, "$1").replace(ROUTE_KEY_SYMBOLS_RE, "$1").replace(ROUTE_KEY_NORMAL_RE, (r) => route.params[r.slice(1)]?.toString() || "");
  return typeof source === "function" ? source(route) : source;
}
function isChangingPage(to, from) {
  if (to === from || from === START_LOCATION) {
    return false;
  }
  if (generateRouteKey(to) !== generateRouteKey(from)) {
    return true;
  }
  const areComponentsSame = to.matched.every(
    (comp, index) => comp.components && comp.components.default === from.matched[index]?.components?.default
  );
  if (areComponentsSame) {
    return false;
  }
  return true;
}
const routerOptions0 = {
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp();
    const hashScrollBehaviour = useRouter().options?.scrollBehaviorType ?? "auto";
    if (to.path.replace(/\/$/, "") === from.path.replace(/\/$/, "")) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior: hashScrollBehaviour };
      }
      return false;
    }
    const routeAllowsScrollToTop = typeof to.meta.scrollToTop === "function" ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop;
    if (routeAllowsScrollToTop === false) {
      return false;
    }
    if (from === START_LOCATION) {
      return _calculatePosition(to, from, savedPosition, hashScrollBehaviour);
    }
    return new Promise((resolve) => {
      const doScroll = () => {
        requestAnimationFrame(() => resolve(_calculatePosition(to, from, savedPosition, hashScrollBehaviour)));
      };
      nuxtApp.hooks.hookOnce("page:loading:end", () => {
        const transitionPromise = nuxtApp["~transitionPromise"];
        if (transitionPromise) {
          transitionPromise.then(doScroll);
        } else {
          doScroll();
        }
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = (void 0).querySelector(selector);
    if (elem) {
      return (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle((void 0).documentElement).scrollPaddingTop) || 0);
    }
  } catch {
  }
  return 0;
}
function _calculatePosition(to, from, savedPosition, defaultHashScrollBehaviour) {
  if (savedPosition) {
    return savedPosition;
  }
  if (to.hash) {
    return {
      el: to.hash,
      top: _getHashElementScrollMarginTop(to.hash),
      behavior: isChangingPage(to, from) ? defaultHashScrollBehaviour : "instant"
    };
  }
  return {
    left: 0,
    top: 0
  };
}
const configRouterOptions = {
  hashMode: false,
  scrollBehaviorType: "auto"
};
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0
};
const validate = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to, from) => {
  let __temp, __restore;
  if (!to.meta?.validate) {
    return;
  }
  const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
  if (result === true) {
    return;
  }
  const error = createError({
    fatal: false,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    status: result && (result.status || result.statusCode) || 404,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    statusText: result && (result.statusText || result.statusMessage) || `Page Not Found: ${to.fullPath}`,
    data: {
      path: to.fullPath
    }
  });
  return error;
});
const __vite_import_meta_env__$2 = { "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SSR": true, "VITE_API_ALLOW_MOCK_FALLBACK": "true", "VITE_API_BASE_URL": "http://localhost:5000/api", "VITE_API_TIMEOUT": "12000", "VITE_API_WITH_CREDENTIALS": "false", "VITE_APP_NAME": "VietNews 24h", "VITE_APP_URL": "https://example.com", "VITE_AUTH_LOGIN_ENDPOINT": "/auth/login", "VITE_AUTH_LOGOUT_ENDPOINT": "/auth/logout", "VITE_AUTH_REFRESH_ENDPOINT": "/auth/refresh", "VITE_AUTH_TOKEN_TYPE": "Bearer", "VITE_NEWS_CACHE_TTL_MS": "60000", "VITE_PORT": "5173", "VITE_USE_MOCK_API": "true" };
const readEnv$2 = (key, fallback = "") => {
  return __vite_import_meta_env__$2?.[key] ?? (typeof process !== "undefined" && process.env ? process.env[key] : void 0) ?? fallback;
};
const readBooleanEnv$1 = (key, fallback = "false") => {
  return String(readEnv$2(key, fallback)).toLowerCase() === "true";
};
const readNumberEnv$1 = (key, fallback) => {
  const value = Number(readEnv$2(key, fallback));
  return Number.isFinite(value) ? value : Number(fallback);
};
const authConfig = {
  tokenType: readEnv$2("VITE_AUTH_TOKEN_TYPE", "Bearer"),
  loginEndpoint: readEnv$2("VITE_AUTH_LOGIN_ENDPOINT", "/auth/login"),
  refreshEndpoint: readEnv$2("VITE_AUTH_REFRESH_ENDPOINT", "/auth/refresh"),
  logoutEndpoint: readEnv$2("VITE_AUTH_LOGOUT_ENDPOINT", "/auth/logout"),
  loginPath: readEnv$2("VITE_AUTH_LOGIN_PATH", "/"),
  refreshBeforeExpiresMs: readNumberEnv$1("VITE_AUTH_REFRESH_BEFORE_EXPIRES_MS", 6e4),
  refreshUsesCookie: readBooleanEnv$1("VITE_AUTH_REFRESH_USES_COOKIE")
};
const unauthorizedListeners = /* @__PURE__ */ new Set();
const setAuthSession = ({
  accessToken: nextAccessToken = "",
  refreshToken: nextRefreshToken = "",
  expiresAt: nextExpiresAt = 0
} = {}) => {
  {
    return;
  }
};
const getAccessToken = () => "";
const getRefreshToken = () => "";
const hasRefreshToken = () => Boolean(getRefreshToken());
const canRefreshAccessToken = () => {
  return hasRefreshToken() || authConfig.refreshUsesCookie;
};
const hasValidAccessToken = () => {
  {
    return false;
  }
};
const shouldRefreshAccessToken = (thresholdMs = authConfig.refreshBeforeExpiresMs) => {
  {
    return false;
  }
};
const getAuthorizationHeader = () => {
  if (!hasValidAccessToken()) {
    return "";
  }
  return `${authConfig.tokenType} ${getAccessToken()}`;
};
const notifyUnauthorized = (payload = {}) => {
  unauthorizedListeners.forEach((listener) => {
    listener(payload);
  });
};
const ALLOWED_HTML_TAGS = Object.freeze([
  "p",
  "br",
  "strong",
  "em",
  "u",
  "a",
  "ul",
  "ol",
  "li",
  "blockquote",
  "h2",
  "h3",
  "h4",
  "img"
]);
const ALLOWED_HTML_ATTR = Object.freeze([
  "href",
  "title",
  "target",
  "rel",
  "src",
  "alt",
  "loading",
  "decoding",
  "referrerpolicy",
  "class"
]);
const FORBIDDEN_HTML_TAGS = Object.freeze([
  "iframe",
  "script",
  "object",
  "embed",
  "style",
  "meta",
  "link",
  "base",
  "form",
  "input",
  "button",
  "textarea",
  "select"
]);
const SAFE_LINK_PATTERN = /^(?:(?:https?|mailto|tel):|\/(?!\/)|#|\.{1,2}\/)/i;
const SAFE_IMAGE_PATTERN = /^(?:(?:https?):|\/(?!\/)|\.{1,2}\/)/i;
const FORBIDDEN_ATTR = Object.freeze(["style", "srcset"]);
const MAX_SEARCH_LENGTH = 120;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/g;
const SEARCH_FORBIDDEN_CHARS = /[^\p{L}\p{N}\s\-_.:,/()+]/gu;
let hookAttached = false;
const attachSanitizeHooks = () => {
  if (hookAttached) {
    return;
  }
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    const elementNodeType = typeof Node === "undefined" ? 1 : Node.ELEMENT_NODE;
    if (!node || node.nodeType !== elementNodeType) {
      return;
    }
    const tag = node.tagName.toLowerCase();
    if (node.hasAttribute("href")) {
      const href = node.getAttribute("href")?.trim() || "";
      if (!SAFE_LINK_PATTERN.test(href)) {
        node.removeAttribute("href");
      }
    }
    if (node.hasAttribute("src")) {
      const src = node.getAttribute("src")?.trim() || "";
      if (tag === "img") {
        if (!SAFE_IMAGE_PATTERN.test(src)) {
          node.removeAttribute("src");
        }
      } else if (!SAFE_LINK_PATTERN.test(src)) {
        node.removeAttribute("src");
      }
    }
    if (tag === "a") {
      node.setAttribute("rel", "noopener noreferrer nofollow");
      node.setAttribute("target", "_blank");
    }
    if (tag === "img") {
      node.setAttribute("loading", "lazy");
      node.setAttribute("decoding", "async");
      node.setAttribute("referrerpolicy", "no-referrer");
    }
  });
  hookAttached = true;
};
const getSanitizeOptions = () => {
  return {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [...ALLOWED_HTML_TAGS],
    ALLOWED_ATTR: [...ALLOWED_HTML_ATTR],
    FORBID_TAGS: [...FORBIDDEN_HTML_TAGS],
    FORBID_ATTR: [...FORBIDDEN_ATTR],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    SANITIZE_NAMED_PROPS: true,
    CUSTOM_ELEMENT_HANDLING: {
      tagNameCheck: null,
      attributeNameCheck: null,
      allowCustomizedBuiltInElements: false
    }
  };
};
const sanitizeHtml = (input = "") => {
  if (typeof input !== "string") {
    return "";
  }
  const content = input.trim();
  if (!content) {
    return "";
  }
  attachSanitizeHooks();
  return DOMPurify.sanitize(content, getSanitizeOptions());
};
const normalizeSearchInput = (value = "") => {
  return value.toString().normalize("NFKC").replace(CONTROL_CHARACTERS, "").replace(SEARCH_FORBIDDEN_CHARS, "").replace(/\s+/g, " ").trim().slice(0, MAX_SEARCH_LENGTH);
};
const generateSlug = (value = "") => {
  return value.toString().replace(/đ/g, "d").replace(/Đ/g, "D").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
};
const normalizeSlug = (slug = "") => {
  return generateSlug(slug).replace(/^-|-$/g, "");
};
const buildNewsPath = (slug = "") => {
  return `/tin-tuc/${normalizeSlug(slug)}`;
};
const buildCategoryPath = (slug = "") => {
  return `/danh-muc/${normalizeSlug(slug)}`;
};
const sanitizePageQuery = (value) => {
  const normalized = Number(value);
  if (Number.isNaN(normalized) || normalized < 2) {
    return "";
  }
  return String(Math.floor(normalized));
};
const buildPathWithSlug = (path, rawSlug, safeSlug) => {
  const encodedRawSlug = encodeURIComponent(rawSlug);
  if (path.includes(encodedRawSlug)) {
    return path.replace(encodedRawSlug, safeSlug);
  }
  return path.replace(rawSlug, safeSlug);
};
const getSafeRedirectPath = (to) => {
  const fullPath = String(to.fullPath || "/");
  return fullPath.startsWith("/") && !fullPath.startsWith("//") ? fullPath : "/";
};
const route_45sanitizer_45global = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
  if (to.meta?.requiresAuth && !hasValidAccessToken()) {
    return navigateTo({
      path: authConfig.loginPath,
      query: {
        redirect: getSafeRedirectPath(to)
      }
    }, { replace: true });
  }
  const nextQuery = { ...to.query };
  let shouldRedirectByQuery = false;
  if (Object.prototype.hasOwnProperty.call(nextQuery, "page")) {
    const safePage = sanitizePageQuery(nextQuery.page);
    if (!safePage) {
      delete nextQuery.page;
      shouldRedirectByQuery = true;
    } else if (safePage !== String(nextQuery.page)) {
      nextQuery.page = safePage;
      shouldRedirectByQuery = true;
    }
  }
  if (to.path === "/tim-kiem" && Object.prototype.hasOwnProperty.call(nextQuery, "q")) {
    const safeQuery = normalizeSearchInput(String(nextQuery.q || ""));
    if (!safeQuery) {
      delete nextQuery.q;
      shouldRedirectByQuery = true;
    } else if (safeQuery !== String(nextQuery.q)) {
      nextQuery.q = safeQuery;
      shouldRedirectByQuery = true;
    }
  }
  const isCategoryDetail = to.path.startsWith("/danh-muc/");
  const isNewsDetail = to.path.startsWith("/tin-tuc/") && to.path !== "/tin-tuc";
  if ((isCategoryDetail || isNewsDetail) && to.params?.slug) {
    const rawSlug = String(Array.isArray(to.params.slug) ? to.params.slug[0] : to.params.slug || "");
    const safeSlug = normalizeSlug(rawSlug);
    if (!safeSlug && rawSlug) {
      return navigateTo("/404", { replace: true });
    }
    if (safeSlug && safeSlug !== rawSlug) {
      return navigateTo({
        path: buildPathWithSlug(to.path, rawSlug, safeSlug),
        query: nextQuery,
        hash: to.hash
      }, { replace: true });
    }
  }
  if (shouldRedirectByQuery) {
    return navigateTo({
      path: to.path,
      query: nextQuery,
      hash: to.hash
    }, { replace: true });
  }
  return true;
});
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
  {
    return;
  }
});
const globalMiddleware = [
  validate,
  route_45sanitizer_45global,
  manifest_45route_45rule
];
const namedMiddleware = {};
Object.assign(/* @__PURE__ */ Object.create(null), {});
const pageIslandRoutes = Object.assign(/* @__PURE__ */ Object.create(null), {});
const plugin$1 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  async setup(nuxtApp) {
    let __temp, __restore;
    let routerBase = (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const history = routerOptions.history?.(routerBase) ?? createMemoryHistory(routerBase);
    const routes2 = routerOptions.routes ? ([__temp, __restore] = executeAsync(() => routerOptions.routes(_routes)), __temp = await __temp, __restore(), __temp) ?? _routes : _routes;
    let startPosition;
    const router = createRouter({
      ...routerOptions,
      scrollBehavior: (to, from, savedPosition) => {
        if (from === START_LOCATION) {
          startPosition = savedPosition;
          return;
        }
        if (routerOptions.scrollBehavior) {
          router.options.scrollBehavior = routerOptions.scrollBehavior;
          if ("scrollRestoration" in (void 0).history) {
            const unsub = router.beforeEach(() => {
              unsub();
              (void 0).history.scrollRestoration = "manual";
            });
          }
          return routerOptions.scrollBehavior(to, START_LOCATION, startPosition || savedPosition);
        }
      },
      history,
      routes: routes2
    });
    nuxtApp.vueApp.use(router);
    const previousRoute = shallowRef(router.currentRoute.value);
    router.afterEach((_to, from) => {
      previousRoute.value = from;
    });
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
      get: () => previousRoute.value
    });
    const initialURL = nuxtApp.ssrContext.url;
    const _route = shallowRef(router.currentRoute.value);
    const syncCurrentRoute = () => {
      _route.value = router.currentRoute.value;
    };
    router.afterEach((to, from) => {
      const lastTo = to.matched.at(-1)?.components?.default;
      const lastFrom = from.matched.at(-1)?.components?.default;
      if (lastTo === lastFrom) {
        syncCurrentRoute();
        return;
      }
      if (to.matched.length < from.matched.length && to.matched.every((m, i) => m.components?.default === from.matched[i]?.components?.default)) {
        syncCurrentRoute();
      }
    });
    const route = { sync: syncCurrentRoute };
    for (const key in _route.value) {
      Object.defineProperty(route, key, {
        get: () => _route.value[key],
        enumerable: true
      });
    }
    nuxtApp._route = shallowReactive(route);
    nuxtApp._middleware ||= {
      global: [],
      named: {}
    };
    const error = /* @__PURE__ */ useError();
    const isServerPage = nuxtApp.ssrContext?.islandContext?.name?.startsWith("page_");
    if (!nuxtApp.ssrContext?.islandContext || isServerPage) {
      router.afterEach(async (to, _from, failure) => {
        delete nuxtApp._processingMiddleware;
        if (failure) {
          await nuxtApp.callHook("page:loading:end");
        }
        if (failure?.type === 4) {
          return;
        }
        if (to.redirectedFrom && to.fullPath !== initialURL) {
          await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
        }
      });
    }
    try {
      if (true) {
        ;
        [__temp, __restore] = executeAsync(() => router.push(initialURL)), await __temp, __restore();
        ;
      }
      ;
      [__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
      ;
    } catch (error2) {
      [__temp, __restore] = executeAsync(() => nuxtApp.runWithContext(() => showError(error2))), await __temp, __restore();
    }
    const resolvedInitialRoute = router.currentRoute.value;
    const hasDeferredRoute = false;
    syncCurrentRoute();
    if (nuxtApp.ssrContext?.islandContext && !isServerPage) {
      return { provide: { router } };
    }
    const initialLayout = nuxtApp.payload.state._layout;
    router.beforeEach(async (to, from) => {
      await nuxtApp.callHook("page:loading:start");
      to.meta = reactive(to.meta);
      if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
        to.meta.layout = initialLayout;
      }
      nuxtApp._processingMiddleware = true;
      if (!nuxtApp.ssrContext?.islandContext || isServerPage) {
        const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
        for (const component of to.matched) {
          const componentMiddleware = component.meta.middleware;
          if (!componentMiddleware) {
            continue;
          }
          for (const entry2 of toArray(componentMiddleware)) {
            middlewareEntries.add(entry2);
          }
        }
        const routeRules = getRouteRules({ path: to.path });
        if (routeRules.appMiddleware) {
          for (const key in routeRules.appMiddleware) {
            if (routeRules.appMiddleware[key]) {
              middlewareEntries.add(key);
            } else {
              middlewareEntries.delete(key);
            }
          }
        }
        for (const entry2 of middlewareEntries) {
          const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await namedMiddleware[entry2]?.().then((r) => r.default || r) : entry2;
          if (!middleware) {
            throw new Error(`Unknown route middleware: '${entry2}'.`);
          }
          try {
            if (false) ;
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            if (true) {
              if (result === false || result instanceof Error) {
                const error2 = result || createError({
                  status: 404,
                  statusText: `Page Not Found: ${initialURL}`
                });
                await nuxtApp.runWithContext(() => showError(error2));
                return false;
              }
            }
            if (result === true) {
              continue;
            }
            if (result === false) {
              return result;
            }
            if (result) {
              if (isNuxtError(result) && result.fatal) {
                await nuxtApp.runWithContext(() => showError(result));
              }
              return result;
            }
          } catch (err) {
            const error2 = createError(err);
            if (error2.fatal) {
              await nuxtApp.runWithContext(() => showError(error2));
            }
            return error2;
          }
        }
      }
    });
    if (isServerPage) {
      router.beforeResolve((to) => {
        const expected = pageIslandRoutes[nuxtApp.ssrContext.islandContext.name];
        const actual = to.matched.find((m) => m.components?.default?.__nuxt_island)?.components?.default;
        if (!expected || expected !== actual?.__nuxt_island) {
          nuxtApp.ssrContext["~renderResponse"] = {
            statusCode: 400,
            statusMessage: "Invalid island request path"
          };
          return false;
        }
      });
    }
    router.onError(async () => {
      delete nuxtApp._processingMiddleware;
      await nuxtApp.callHook("page:loading:end");
    });
    router.afterEach((to) => {
      if (to.matched.length === 0 && !error.value) {
        return nuxtApp.runWithContext(() => showError(createError({
          status: 404,
          fatal: false,
          statusText: `Page not found: ${to.fullPath}`,
          data: {
            path: to.fullPath
          }
        })));
      }
    });
    nuxtApp.hooks.hookOnce("app:created", async () => {
      try {
        if ("name" in resolvedInitialRoute) {
          resolvedInitialRoute.name = void 0;
        }
        if (hasDeferredRoute) ;
        else {
          await router.replace({
            ...resolvedInitialRoute,
            force: true
          });
        }
        router.options.scrollBehavior = routerOptions.scrollBehavior;
      } catch (error2) {
        await nuxtApp.runWithContext(() => showError(error2));
      }
    });
    return { provide: { router } };
  }
});
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const clientOnlySymbol = /* @__PURE__ */ Symbol.for("nuxt:client-only");
defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  ...false,
  setup(props, { slots, attrs }) {
    const mounted = shallowRef(false);
    const vm = getCurrentInstance();
    if (vm) {
      vm._nuxtClientOnly = true;
    }
    provide(clientOnlySymbol, true);
    return () => {
      if (mounted.value) {
        const vnodes = slots.default?.();
        if (vnodes && vnodes.length === 1) {
          return [cloneVNode(vnodes[0], attrs)];
        }
        return vnodes;
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return h(slot);
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
function useRequestEvent(nuxtApp) {
  nuxtApp ||= useNuxtApp();
  return nuxtApp.ssrContext?.event;
}
function setResponseStatus(arg1, arg2, arg3) {
  const event = useRequestEvent();
  if (event) {
    return setResponseStatus$1(event, arg1, arg2);
  }
}
const CookieDefaults = {
  path: "/",
  watch: true,
  decode: (val) => {
    const decoded = decodeURIComponent(val);
    const parsed = destr(decoded);
    if (typeof parsed === "number" && (!Number.isFinite(parsed) || String(parsed) !== decoded)) {
      return decoded;
    }
    return parsed;
  },
  encode: (val) => encodeURIComponent(typeof val === "string" ? val : JSON.stringify(val))
};
function useCookie(name, _opts) {
  const opts = { ...CookieDefaults, ..._opts };
  opts.filter ??= (key) => key === name;
  const cookies = readRawCookies(opts) || {};
  let delay2;
  if (opts.maxAge !== void 0) {
    delay2 = opts.maxAge * 1e3;
  } else if (opts.expires) {
    delay2 = opts.expires.getTime() - Date.now();
  }
  const hasExpired = delay2 !== void 0 && delay2 <= 0;
  const cookieValue = klona(hasExpired ? void 0 : cookies[name] ?? opts.default?.());
  const cookie = ref(cookieValue);
  {
    const nuxtApp = useNuxtApp();
    const writeFinalCookieValue = () => {
      if (opts.readonly || isEqual(cookie.value, cookies[name])) {
        return;
      }
      nuxtApp._cookies ||= {};
      if (name in nuxtApp._cookies) {
        if (isEqual(cookie.value, nuxtApp._cookies[name])) {
          return;
        }
      }
      nuxtApp._cookies[name] = cookie.value;
      writeServerCookie(useRequestEvent(nuxtApp), name, cookie.value, opts);
    };
    const unhook = nuxtApp.hooks.hookOnce("app:rendered", writeFinalCookieValue);
    nuxtApp.hooks.hookOnce("app:error", () => {
      unhook();
      return writeFinalCookieValue();
    });
  }
  return cookie;
}
function readRawCookies(opts = {}) {
  {
    return parse(getRequestHeader(useRequestEvent(), "cookie") || "", opts);
  }
}
function writeServerCookie(event, name, value, opts = {}) {
  if (event) {
    if (value !== null && value !== void 0) {
      return setCookie(event, name, value, opts);
    }
    if (getCookie(event, name) !== void 0) {
      return deleteCookie(event, name, opts);
    }
  }
}
const firstNonUndefined = (...args) => args.find((arg) => arg !== void 0);
function sanitizeExternalHref(value) {
  let candidate = value.replace(/[\u0000-\u001f\s]+/g, "");
  while (candidate.toLowerCase().startsWith("view-source:")) {
    candidate = candidate.slice("view-source:".length);
  }
  const colon = candidate.indexOf(":");
  if (colon > 0 && isScriptProtocol(candidate.slice(0, colon + 1))) {
    return null;
  }
  return value;
}
// @__NO_SIDE_EFFECTS__
function defineNuxtLink(options) {
  const componentName = options.componentName || "NuxtLink";
  function isHashLinkWithoutHashMode(link) {
    return typeof link === "string" && link.startsWith("#");
  }
  function resolveTrailingSlashBehavior(to, resolve, trailingSlash) {
    const effectiveTrailingSlash = trailingSlash ?? options.trailingSlash;
    if (!to || effectiveTrailingSlash !== "append" && effectiveTrailingSlash !== "remove") {
      return to;
    }
    if (typeof to === "string") {
      return applyTrailingSlashBehavior(to, effectiveTrailingSlash);
    }
    const path = "path" in to && to.path !== void 0 ? to.path : resolve(to).path;
    const resolvedPath = {
      ...to,
      name: void 0,
      // named routes would otherwise always override trailing slash behavior
      path: applyTrailingSlashBehavior(path, effectiveTrailingSlash)
    };
    return resolvedPath;
  }
  function useNuxtLink(props) {
    const router = useRouter();
    const config = /* @__PURE__ */ useRuntimeConfig();
    const hasTarget = computed(() => !!unref(props.target) && unref(props.target) !== "_self");
    const isAbsoluteUrl = computed(() => {
      const path = unref(props.to) || unref(props.href) || "";
      return typeof path === "string" && hasProtocol(path, { acceptRelative: true });
    });
    const builtinRouterLink = resolveComponent("RouterLink");
    const useBuiltinLink = builtinRouterLink && typeof builtinRouterLink !== "string" ? builtinRouterLink.useLink : void 0;
    const isExternal = computed(() => {
      if (unref(props.external)) {
        return true;
      }
      const path = unref(props.to) || unref(props.href) || "";
      if (typeof path === "object") {
        return false;
      }
      return path === "" || isAbsoluteUrl.value;
    });
    const to = computed(() => {
      const path = unref(props.to) || unref(props.href) || "";
      if (isExternal.value) {
        return path;
      }
      return resolveTrailingSlashBehavior(path, router.resolve, unref(props.trailingSlash));
    });
    const link = isExternal.value ? void 0 : useBuiltinLink?.({ ...props, to, viewTransition: unref(props.viewTransition) });
    const href = computed(() => {
      const effectiveTrailingSlash = unref(props.trailingSlash) ?? options.trailingSlash;
      if (!to.value || isAbsoluteUrl.value || isHashLinkWithoutHashMode(to.value)) {
        const raw = to.value;
        return typeof raw === "string" ? sanitizeExternalHref(raw) : raw;
      }
      if (isExternal.value) {
        const path = typeof to.value === "object" && "path" in to.value ? resolveRouteObject(to.value) : to.value;
        const href2 = typeof path === "object" ? router.resolve(path).href : path;
        const safe = typeof href2 === "string" ? sanitizeExternalHref(href2) : href2;
        return safe === null ? null : applyTrailingSlashBehavior(safe, effectiveTrailingSlash);
      }
      if (typeof to.value === "object") {
        return router.resolve(to.value)?.href ?? null;
      }
      return applyTrailingSlashBehavior(joinURL(config.app.baseURL, to.value), effectiveTrailingSlash);
    });
    return {
      to,
      hasTarget,
      isAbsoluteUrl,
      isExternal,
      //
      href,
      isActive: link?.isActive ?? computed(() => to.value === router.currentRoute.value.path),
      isExactActive: link?.isExactActive ?? computed(() => to.value === router.currentRoute.value.path),
      route: link?.route ?? computed(() => router.resolve(to.value)),
      async navigate(_e) {
        if (href.value === null) {
          return;
        }
        await navigateTo(href.value, { replace: unref(props.replace), external: isExternal.value || hasTarget.value });
      }
    };
  }
  return defineComponent({
    name: componentName,
    props: {
      // Routing
      to: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      href: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      // Attributes
      target: {
        type: String,
        default: void 0,
        required: false
      },
      rel: {
        type: String,
        default: void 0,
        required: false
      },
      noRel: {
        type: Boolean,
        default: void 0,
        required: false
      },
      // Prefetching
      prefetch: {
        type: Boolean,
        default: void 0,
        required: false
      },
      prefetchOn: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      noPrefetch: {
        type: Boolean,
        default: void 0,
        required: false
      },
      // Styling
      activeClass: {
        type: String,
        default: void 0,
        required: false
      },
      exactActiveClass: {
        type: String,
        default: void 0,
        required: false
      },
      prefetchedClass: {
        type: String,
        default: void 0,
        required: false
      },
      // Vue Router's `<RouterLink>` additional props
      replace: {
        type: Boolean,
        default: void 0,
        required: false
      },
      ariaCurrentValue: {
        type: String,
        default: void 0,
        required: false
      },
      // Edge cases handling
      external: {
        type: Boolean,
        default: void 0,
        required: false
      },
      // Slot API
      custom: {
        type: Boolean,
        default: void 0,
        required: false
      },
      // Behavior
      trailingSlash: {
        type: String,
        default: void 0,
        required: false
      }
    },
    useLink: useNuxtLink,
    setup(props, { slots }) {
      const router = useRouter();
      const { to, href, navigate, isExternal, hasTarget, isAbsoluteUrl } = useNuxtLink(props);
      shallowRef(false);
      const el = void 0;
      const elRef = void 0;
      async function prefetch(nuxtApp = useNuxtApp()) {
        {
          return;
        }
      }
      return () => {
        if (!isExternal.value && !hasTarget.value && !isHashLinkWithoutHashMode(to.value)) {
          const routerLinkProps = {
            ref: elRef,
            to: to.value,
            activeClass: props.activeClass || options.activeClass,
            exactActiveClass: props.exactActiveClass || options.exactActiveClass,
            replace: props.replace,
            ariaCurrentValue: props.ariaCurrentValue,
            custom: props.custom
          };
          if (!props.custom) {
            routerLinkProps.rel = props.rel || void 0;
          }
          return h(
            resolveComponent("RouterLink"),
            routerLinkProps,
            slots.default
          );
        }
        const target = props.target || null;
        const rel = firstNonUndefined(
          // converts `""` to `null` to prevent the attribute from being added as empty (`rel=""`)
          props.noRel ? "" : props.rel,
          options.externalRelAttribute,
          /*
          * A fallback rel of `noopener noreferrer` is applied for external links or links that open in a new tab.
          * This solves a reverse tabnapping security flaw in browsers pre-2021 as well as improving privacy.
          */
          isAbsoluteUrl.value || hasTarget.value ? "noopener noreferrer" : ""
        ) || null;
        if (props.custom) {
          if (!slots.default) {
            return null;
          }
          return slots.default({
            href: href.value,
            navigate,
            prefetch,
            get route() {
              if (!href.value) {
                return void 0;
              }
              const url = new URL(href.value, "http://localhost");
              return {
                path: url.pathname,
                fullPath: url.pathname,
                get query() {
                  return parseQuery(url.search);
                },
                hash: url.hash,
                params: {},
                name: void 0,
                matched: [],
                redirectedFrom: void 0,
                meta: {},
                href: href.value
              };
            },
            rel,
            target,
            isExternal: isExternal.value || hasTarget.value,
            isActive: false,
            isExactActive: false
          });
        }
        return h("a", {
          ref: el,
          href: href.value || null,
          // converts `""` to `null` to prevent the attribute from being added as empty (`href=""`)
          rel,
          target,
          onClick: async (event) => {
            if (isExternal.value || hasTarget.value) {
              return;
            }
            event.preventDefault();
            try {
              const encodedHref = encodeRoutePath(href.value ?? "");
              return await (props.replace ? router.replace(encodedHref) : router.push(encodedHref));
            } finally {
            }
          }
        }, slots.default?.());
      };
    }
  });
}
const __nuxt_component_0$1 = /* @__PURE__ */ defineNuxtLink(nuxtLinkDefaults);
function applyTrailingSlashBehavior(to, trailingSlash) {
  const normalizeFn = trailingSlash === "append" ? withTrailingSlash : withoutTrailingSlash;
  const hasProtocolDifferentFromHttp = hasProtocol(to) && !to.startsWith("http");
  if (hasProtocolDifferentFromHttp) {
    return to;
  }
  return normalizeFn(to, true);
}
const plugin = /* @__PURE__ */ defineNuxtPlugin({
  name: "pinia",
  setup(nuxtApp) {
    const pinia = createPinia();
    nuxtApp.vueApp.use(pinia);
    setActivePinia(pinia);
    if (nuxtApp.payload && nuxtApp.payload.pinia) {
      pinia.state.value = nuxtApp.payload.pinia;
    }
    return {
      provide: {
        pinia
      }
    };
  },
  hooks: {
    "app:rendered"() {
      const nuxtApp = useNuxtApp();
      nuxtApp.payload.pinia = toRaw(nuxtApp.$pinia).state.value;
      setActivePinia(void 0);
    }
  }
});
const components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const SUPPORTED_LOCALES = Object.freeze(["vi", "en"]);
const DEFAULT_LOCALE = "vi";
const LOCALE_STORAGE_KEY = "vietnews_locale";
const HREFLANG_MAP = Object.freeze({
  vi: "vi-VN",
  en: "en-US"
});
const FALLBACK_HREFLANG = "x-default";
const isSupportedLocale = (value = "") => {
  return SUPPORTED_LOCALES.includes(String(value || "").toLowerCase());
};
const app$1 = { "name": "VietNews 24h" };
const language$1 = { "label": "Language", "vi": "VI", "en": "EN" };
const nav$1 = { "home": "Home", "latest": "Latest", "about": "About", "contact": "Contact", "search": "Search", "categories": "Categories" };
const categories$2 = { "thoiSu": "Current Affairs", "kinhDoanh": "Business", "congNghe": "Technology", "theThao": "Sports" };
const common$1 = { "close": "Close", "search": "Search", "searchPlaceholder": "Search news...", "goHome": "Back to home", "emptyTitle": "No data yet", "emptyDescription": "No matching content is available right now. Please try again later.", "previous": "Previous", "next": "Next", "tags": "Tags", "views": "views", "author": "Author", "editorialTeam": "Editorial team", "results": "results", "category": "Category", "all": "View all", "readMore": "Read more" };
const auth$1 = { "expiredMessage": "Your session has expired. Please sign in again to continue secure actions." };
const header$1 = { "menuAria": "Open menu", "searchPlaceholder": "Search by title, topic, or tag..." };
const mobileMenu$1 = { "ariaLabel": "Mobile menu" };
const footer$1 = { "description": "A modern news platform with curated content, fast updates, and an optimized reading experience on every device.", "categoryTitle": "Categories", "contactTitle": "Contact", "copyright": "© {year} VietNews 24h. All rights reserved." };
const home$1 = { "srTitle": "VietNews 24h - latest news homepage", "errorTitle": "Unable to load homepage data", "hotTitle": "Hot news", "topReads": "Top reads", "hotPicks": "Editor's picks" };
const news$1 = { "featured": "Featured news", "featuredEmpty": "No featured stories yet.", "latest": "Latest news", "popular": "Most viewed", "related": "Related news", "sidebarFeatured": "Featured news", "latestPageTitle": "Latest news", "latestCount": "{count} articles", "listLoadError": "Unable to load the news list", "listEmptyTitle": "No articles yet", "listEmptyDescription": "There are currently no matching articles to display.", "detailLoadError": "Unable to load article details", "detailNotFoundTitle": "Article not found", "detailNotFoundDescription": "This article URL may have changed or the content may have been removed." };
const categoryPage$1 = { "titlePrefix": "Category: {name}", "defaultTitle": "News category", "loadErrorTitle": "Unable to load category", "notFoundTitle": "Category not found", "notFoundDescription": "The category URL may have changed or no longer exists." };
const searchPage$1 = { "breadcrumb": "Search", "placeholder": "Enter keywords to find articles...", "title": "Search results", "keywordLabel": "Keyword: {keyword} - {count} results", "loadErrorTitle": "Unable to load search results", "emptyKeywordTitle": "Enter a keyword to start", "emptyKeywordDescription": "You can search by article title, summary, or tags.", "emptyResultTitle": "No results found", "emptyResultDescription": "Try a shorter keyword or another topic." };
const aboutPage$1 = { "breadcrumb": "About", "title": "About VietNews 24h", "intro": "VietNews 24h is a news platform focused on speed, reliability, and a modern reading experience. We prioritize valuable content, clearly edited and continuously updated.", "missionTitle": "Mission", "missionText": "Connect readers with high-quality information to help them quickly and accurately understand the full picture.", "valuesTitle": "Core values", "value1": "Accuracy and transparency.", "value2": "Clear, useful, and in-depth content.", "value3": "User experience first across all devices." };
const contactPage$1 = { "breadcrumb": "Contact", "title": "Contact", "intro": "If you have content feedback, partnership requests, or system issue reports, please send us your information.", "officeTitle": "Editorial office information", "address": "Address: 25 Nguyen Hue, District 1, Ho Chi Minh City", "email": "Email: contact{'@'}vietnews24h.vn", "hotline": "Hotline: 1900 6868", "workTime": "Working hours: 08:00 - 18:00 (Monday to Saturday)", "quickFormTitle": "Quick contact form", "fullNameLabel": "Full name", "emailLabel": "Email", "contentLabel": "Message", "submit": "Send" };
const notFoundPage$1 = { "title": "Page not found", "description": "The link you visited may have changed or no longer exists. Please return to the homepage to continue reading the latest news." };
const seo$1 = { "default": { "title": "VietNews 24h - latest news every day", "description": "A daily updated news portal with curated content and a clean reading experience across devices.", "keywords": "news, breaking news, current affairs, technology, business" }, "home": { "title": "VietNews 24h - latest news every day", "description": "Latest highlights, breaking stories, and important daily topics.", "keywords": "today news, breaking news, current affairs, technology, business" }, "newsList": { "title": "Latest news - VietNews 24h", "description": "A continuously updated list of latest articles across categories.", "keywords": "news list, latest news, vietnews 24h" }, "search": { "titleWithKeyword": 'Search "{keyword}" - VietNews 24h', "title": "Search news - VietNews 24h", "descriptionWithKeyword": "Search results for keyword {keyword}.", "description": "Search articles by topic, keyword, or tags.", "keywordsWithKeyword": "{keyword}, news search", "keywords": "news search" }, "about": { "title": "About - VietNews 24h", "description": "Mission, growth direction, and core values of VietNews 24h.", "keywords": "about, vietnews 24h, digital newsroom" }, "contact": { "title": "Contact - VietNews 24h", "description": "Contact information for the VietNews 24h editorial team and quick feedback form.", "keywords": "contact, newsroom, support" }, "categoryNotFound": { "title": "Category not found - VietNews 24h", "description": "The requested category could not be found.", "keywords": "category, news" }, "newsNotFound": { "title": "Article not found - VietNews 24h", "description": "The requested article URL could not be found.", "keywords": "news, article details" }, "notFound": { "title": "404 - Page not found | VietNews 24h", "description": "The page you requested does not exist on VietNews 24h.", "keywords": "404, page not found" } };
const errors$1 = { "common": { "default": "Something went wrong. Please try again later." }, "http": { "400": "Invalid request. Please check your submitted data.", "401": "Your session is invalid or has expired.", "403": "You do not have permission to access this resource.", "404": "The requested resource could not be found.", "408": "The request timed out. Please try again.", "429": "Too many requests. Please try again in a few minutes.", "500": "The system is busy. Please try again later.", "502": "The service is temporarily unavailable. Please try again later.", "503": "The service is not ready yet. Please try again later.", "504": "The server response timed out. Please try again later." }, "code": { "ECONNABORTED": "The connection timed out. Please try again.", "ERR_NETWORK": "Unable to connect to the server. Please check your network.", "ERR_CANCELED": "The request was canceled." }, "fallback": { "homeLoad": "Unable to load homepage data.", "categoryNewsLoad": "Unable to load category news.", "newsListLoad": "Unable to load the news list.", "newsDetailLoad": "Unable to load article details.", "searchLoad": "Unable to load search results.", "categoryLoad": "Unable to load categories.", "categoryNotFound": "Category not found.", "requestInit": "Unable to initialize the server request.", "requestHandle": "Unable to process the request. Please try again later.", "loginFailed": "Unable to sign in. Please check your credentials.", "refreshExpired": "Your session has expired. Please sign in again." } };
const en = {
  app: app$1,
  language: language$1,
  nav: nav$1,
  categories: categories$2,
  common: common$1,
  auth: auth$1,
  header: header$1,
  mobileMenu: mobileMenu$1,
  footer: footer$1,
  home: home$1,
  news: news$1,
  categoryPage: categoryPage$1,
  searchPage: searchPage$1,
  aboutPage: aboutPage$1,
  contactPage: contactPage$1,
  notFoundPage: notFoundPage$1,
  seo: seo$1,
  errors: errors$1
};
const app = { "name": "VietNews 24h" };
const language = { "label": "Ngôn ngữ", "vi": "VI", "en": "EN" };
const nav = { "home": "Trang chủ", "latest": "Tin mới", "about": "Giới thiệu", "contact": "Liên hệ", "search": "Tìm kiếm", "categories": "Danh mục" };
const categories$1 = { "thoiSu": "Thời sự", "kinhDoanh": "Kinh doanh", "congNghe": "Công nghệ", "theThao": "Thể thao" };
const common = { "close": "Đóng", "search": "Tìm", "searchPlaceholder": "Tìm kiếm tin tức...", "goHome": "Về trang chủ", "emptyTitle": "Chưa có dữ liệu", "emptyDescription": "Hiện chưa có nội dung phù hợp. Vui lòng thử lại sau.", "previous": "Trước", "next": "Sau", "tags": "Tags", "views": "lượt xem", "author": "Tác giả", "editorialTeam": "Ban biên tập", "results": "kết quả", "category": "Danh mục", "all": "Xem tất cả", "readMore": "Xem thêm" };
const auth = { "expiredMessage": "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục thao tác bảo mật." };
const header = { "menuAria": "Mở menu", "searchPlaceholder": "Tìm theo tiêu đề, chủ đề hoặc tag..." };
const mobileMenu = { "ariaLabel": "Menu di động" };
const footer = { "description": "Nền tảng tin tức hiện đại với nội dung được chọn lọc, cập nhật nhanh và tối ưu trải nghiệm đọc trên mọi thiết bị.", "categoryTitle": "Chuyên mục", "contactTitle": "Liên hệ", "copyright": "© {year} VietNews 24h. All rights reserved." };
const home = { "srTitle": "VietNews 24h - Trang chủ tin tức mới nhất", "errorTitle": "Không thể tải dữ liệu trang chủ", "hotTitle": "Tin hot", "topReads": "Đọc nhiều", "hotPicks": "Tin đề xuất" };
const news = { "featured": "Tin nổi bật", "featuredEmpty": "Chưa có tin nổi bật.", "latest": "Tin mới nhất", "popular": "Tin xem nhiều", "related": "Tin liên quan", "sidebarFeatured": "Tin nổi bật", "latestPageTitle": "Tin tức mới nhất", "latestCount": "{count} bài viết", "listLoadError": "Không tải được danh sách tin tức", "listEmptyTitle": "Chưa có bài viết", "listEmptyDescription": "Hiện chưa có bài viết phù hợp để hiển thị.", "detailLoadError": "Không tải được tin chi tiết", "detailNotFoundTitle": "Bài viết không tồn tại", "detailNotFoundDescription": "Liên kết bài viết có thể đã thay đổi hoặc nội dung đã được gỡ bỏ." };
const categoryPage = { "titlePrefix": "Danh mục: {name}", "defaultTitle": "Danh mục tin tức", "loadErrorTitle": "Không tải được danh mục", "notFoundTitle": "Danh mục không tồn tại", "notFoundDescription": "Đường dẫn danh mục có thể đã thay đổi hoặc không còn dữ liệu." };
const searchPage = { "breadcrumb": "Tìm kiếm", "placeholder": "Nhập từ khóa để tìm bài viết...", "title": "Kết quả tìm kiếm", "keywordLabel": "Từ khóa: {keyword} - {count} kết quả", "loadErrorTitle": "Không tải được kết quả tìm kiếm", "emptyKeywordTitle": "Nhập từ khóa để bắt đầu", "emptyKeywordDescription": "Bạn có thể tìm theo tiêu đề bài viết, phần tóm tắt hoặc từ khóa tags.", "emptyResultTitle": "Không tìm thấy kết quả", "emptyResultDescription": "Thử dùng từ khóa ngắn hơn hoặc đổi chủ đề tìm kiếm khác." };
const aboutPage = { "breadcrumb": "Giới thiệu", "title": "Giới thiệu VietNews 24h", "intro": "VietNews 24h là nền tảng tin tức hướng tới tốc độ, độ tin cậy và trải nghiệm đọc hiện đại. Chúng tôi tập trung vào nội dung có giá trị, được biên tập rõ ràng và cập nhật liên tục.", "missionTitle": "Sứ mệnh", "missionText": "Kết nối độc giả với thông tin chất lượng cao, giúp người đọc nắm bắt bức tranh toàn cảnh một cách nhanh chóng và chính xác.", "valuesTitle": "Giá trị cốt lõi", "value1": "Chính xác và minh bạch.", "value2": "Nội dung dễ hiểu, hữu ích và có chiều sâu.", "value3": "Ưu tiên trải nghiệm người dùng trên mọi thiết bị." };
const contactPage = { "breadcrumb": "Liên hệ", "title": "Liên hệ", "intro": "Nếu bạn có góp ý nội dung, hợp tác truyền thông hoặc báo lỗi hệ thống, vui lòng gửi thông tin cho chúng tôi.", "officeTitle": "Thông tin tòa soạn", "address": "Địa chỉ: 25 Nguyễn Huệ, Quận 1, TP.HCM", "email": "Email: contact{'@'}vietnews24h.vn", "hotline": "Hotline: 1900 6868", "workTime": "Giờ làm việc: 08:00 - 18:00 (Thứ 2 đến Thứ 7)", "quickFormTitle": "Gửi liên hệ nhanh", "fullNameLabel": "Họ và tên", "emailLabel": "Email", "contentLabel": "Nội dung", "submit": "Gửi thông tin" };
const notFoundPage = { "title": "Không tìm thấy trang", "description": "Liên kết bạn truy cập có thể đã thay đổi hoặc không còn tồn tại. Hãy quay về trang chủ để tiếp tục đọc tin mới nhất." };
const seo = { "default": { "title": "VietNews 24h - Tin tức mới nhất mỗi ngày", "description": "Trang tin tổng hợp cập nhật liên tục, nội dung chọn lọc và dễ đọc trên mọi thiết bị.", "keywords": "tin tức, tin nóng, thời sự, công nghệ, kinh doanh" }, "home": { "title": "VietNews 24h - Tin tức mới nhất mỗi ngày", "description": "Cập nhật tin tức nổi bật, tin mới, tin hot và các chủ đề quan trọng trong ngày.", "keywords": "tin tức hôm nay, tin nóng, thời sự, công nghệ, kinh doanh" }, "newsList": { "title": "Tin tức mới nhất - VietNews 24h", "description": "Danh sách tin tức mới nhất, nội dung đa chuyên mục được cập nhật liên tục.", "keywords": "danh sách tin tức, tin mới nhất, vietnews 24h" }, "search": { "titleWithKeyword": 'Tìm kiếm "{keyword}" - VietNews 24h', "title": "Tìm kiếm tin tức - VietNews 24h", "descriptionWithKeyword": "Kết quả tìm kiếm cho từ khóa {keyword}.", "description": "Tìm kiếm bài viết theo chủ đề, từ khóa hoặc tags.", "keywordsWithKeyword": "{keyword}, tìm kiếm tin tức", "keywords": "tìm kiếm tin tức" }, "about": { "title": "Giới thiệu - VietNews 24h", "description": "Thông tin về sứ mệnh, định hướng phát triển và giá trị cốt lõi của VietNews 24h.", "keywords": "giới thiệu, vietnews 24h, tòa soạn số" }, "contact": { "title": "Liên hệ - VietNews 24h", "description": "Thông tin liên hệ tòa soạn VietNews 24h và biểu mẫu góp ý nhanh.", "keywords": "liên hệ, tòa soạn, hỗ trợ" }, "categoryNotFound": { "title": "Danh mục không tồn tại - VietNews 24h", "description": "Không tìm thấy danh mục theo yêu cầu.", "keywords": "danh mục, tin tức" }, "newsNotFound": { "title": "Bài viết không tồn tại - VietNews 24h", "description": "Không tìm thấy bài viết theo đường dẫn yêu cầu.", "keywords": "tin tức, chi tiết bài viết" }, "notFound": { "title": "404 - Trang không tồn tại | VietNews 24h", "description": "Trang bạn yêu cầu không tồn tại trên hệ thống VietNews 24h.", "keywords": "404, trang không tồn tại" } };
const errors = { "common": { "default": "Đã có lỗi xảy ra. Vui lòng thử lại sau." }, "http": { "400": "Yêu cầu không hợp lệ. Vui lòng kiểm tra dữ liệu gửi lên.", "401": "Phiên đăng nhập đã hết hạn hoặc không hợp lệ.", "403": "Bạn không có quyền truy cập tài nguyên này.", "404": "Dữ liệu yêu cầu không tồn tại.", "408": "Yêu cầu quá thời gian chờ. Vui lòng thử lại.", "429": "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.", "500": "Hệ thống đang bận. Vui lòng thử lại sau.", "502": "Dịch vụ đang tạm gián đoạn. Vui lòng thử lại sau.", "503": "Dịch vụ hiện chưa sẵn sàng. Vui lòng thử lại sau.", "504": "Máy chủ phản hồi quá chậm. Vui lòng thử lại sau." }, "code": { "ECONNABORTED": "Kết nối quá thời gian chờ. Vui lòng thử lại.", "ERR_NETWORK": "Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.", "ERR_CANCELED": "Yêu cầu đã bị hủy." }, "fallback": { "homeLoad": "Không tải được dữ liệu trang chủ.", "categoryNewsLoad": "Không tải được danh sách tin theo danh mục.", "newsListLoad": "Không tải được danh sách tin tức.", "newsDetailLoad": "Không tải được tin chi tiết.", "searchLoad": "Không tải được kết quả tìm kiếm.", "categoryLoad": "Không tải được danh mục.", "categoryNotFound": "Không tìm thấy danh mục.", "requestInit": "Không thể khởi tạo yêu cầu tới máy chủ.", "requestHandle": "Không thể xử lý yêu cầu. Vui lòng thử lại sau.", "loginFailed": "Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.", "refreshExpired": "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." } };
const vi = {
  app,
  language,
  nav,
  categories: categories$1,
  common,
  auth,
  header,
  mobileMenu,
  footer,
  home,
  news,
  categoryPage,
  searchPage,
  aboutPage,
  contactPage,
  notFoundPage,
  seo,
  errors
};
const normalizeLocale$2 = (value = DEFAULT_LOCALE) => {
  const safeLocale = String(value || "").toLowerCase();
  return isSupportedLocale(safeLocale) ? safeLocale : DEFAULT_LOCALE;
};
const getLocaleFromStorage = () => {
  {
    return DEFAULT_LOCALE;
  }
};
const createAppI18n = (initialLocale = getLocaleFromStorage()) => createI18n({
  legacy: false,
  locale: normalizeLocale$2(initialLocale),
  fallbackLocale: DEFAULT_LOCALE,
  warnHtmlMessage: false,
  messages: {
    vi,
    en
  }
});
let i18n = createAppI18n();
const setI18nInstance = (instance) => {
  i18n = instance || createAppI18n();
};
const normalizeLocale$1 = (value) => {
  const safeLocale = String(value || "").toLowerCase();
  return isSupportedLocale(safeLocale) ? safeLocale : DEFAULT_LOCALE;
};
const i18n_SMdHjDdqIId1QK07LHAPEyr3HZfMyKcn2rAtnZisyJE = /* @__PURE__ */ defineNuxtPlugin((nuxtApp) => {
  const route = useRoute();
  const localeCookie = useCookie(LOCALE_STORAGE_KEY, {
    default: () => DEFAULT_LOCALE,
    sameSite: "lax",
    path: "/"
  });
  const queryLocale = Array.isArray(route.query.lang) ? route.query.lang[0] : route.query.lang;
  const initialLocale = normalizeLocale$1(queryLocale || localeCookie.value);
  const i18n2 = createAppI18n(initialLocale);
  setI18nInstance(i18n2);
  nuxtApp.vueApp.use(i18n2);
});
const prerender_server_sqIxOBipVr4FbVMA9kqWL0wT8FPop6sKAXLVfifsJzk = /* @__PURE__ */ defineNuxtPlugin(async () => {
  {
    return;
  }
});
const plugins = [
  payloadPlugin,
  unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU,
  plugin$1,
  revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms,
  plugin,
  components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4,
  i18n_SMdHjDdqIId1QK07LHAPEyr3HZfMyKcn2rAtnZisyJE,
  prerender_server_sqIxOBipVr4FbVMA9kqWL0wT8FPop6sKAXLVfifsJzk
];
const defineRouteProvider = (name = "RouteProvider") => defineComponent({
  name,
  props: {
    route: {
      type: Object,
      required: true
    },
    vnode: Object,
    vnodeRef: Object,
    renderKey: String,
    trackRootNodes: Boolean
  },
  setup(props) {
    const previousKey = props.renderKey;
    const previousRoute = props.route;
    const route = {};
    for (const key in props.route) {
      Object.defineProperty(route, key, {
        get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key],
        enumerable: true
      });
    }
    provide(PageRouteSymbol, shallowReactive(route));
    return () => {
      if (!props.vnode) {
        return props.vnode;
      }
      return h(props.vnode, { ref: props.vnodeRef });
    };
  }
});
const RouteProvider = defineRouteProvider();
const __nuxt_component_0 = defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs, slots, expose }) {
    const nuxtApp = useNuxtApp();
    const pageRef = ref();
    inject(PageRouteSymbol, null);
    expose({ pageRef });
    inject(LayoutMetaSymbol, null);
    nuxtApp.deferHydration();
    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          return h(Suspense, { suspensible: true }, {
            default() {
              return h(RouteProvider, {
                vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
                route: routeProps.route,
                vnodeRef: pageRef
              });
            }
          });
        }
      });
    };
  }
});
function normalizeSlot(slot, data) {
  const slotContent = slot(data);
  return slotContent.length === 1 ? h(slotContent[0]) : h(Fragment, void 0, slotContent);
}
const normalizeLocale = (value = DEFAULT_LOCALE) => {
  const safeLocale = String(value || "").toLowerCase();
  return SUPPORTED_LOCALES.includes(safeLocale) ? safeLocale : DEFAULT_LOCALE;
};
const useLocale = () => {
  const { locale } = useI18n({ useScope: "global" });
  const currentLocale = computed(() => normalizeLocale(locale.value));
  const setLocale = (nextLocale) => {
    const safeLocale = normalizeLocale(nextLocale);
    locale.value = safeLocale;
  };
  const toggleLocale = () => {
    const nextLocale = currentLocale.value === "vi" ? "en" : "vi";
    setLocale(nextLocale);
  };
  return {
    locale: currentLocale,
    setLocale,
    toggleLocale,
    locales: [...SUPPORTED_LOCALES]
  };
};
const __vite_import_meta_env__$1 = { "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SSR": true, "VITE_API_ALLOW_MOCK_FALLBACK": "true", "VITE_API_BASE_URL": "http://localhost:5000/api", "VITE_API_TIMEOUT": "12000", "VITE_API_WITH_CREDENTIALS": "false", "VITE_APP_NAME": "VietNews 24h", "VITE_APP_URL": "https://example.com", "VITE_AUTH_LOGIN_ENDPOINT": "/auth/login", "VITE_AUTH_LOGOUT_ENDPOINT": "/auth/logout", "VITE_AUTH_REFRESH_ENDPOINT": "/auth/refresh", "VITE_AUTH_TOKEN_TYPE": "Bearer", "VITE_NEWS_CACHE_TTL_MS": "60000", "VITE_PORT": "5173", "VITE_USE_MOCK_API": "true" };
const readEnv$1 = (key, fallback = "") => {
  return __vite_import_meta_env__$1?.[key] ?? (typeof process !== "undefined" && process.env ? process.env[key] : void 0) ?? fallback;
};
const appConfig = {
  appName: readEnv$1("VITE_APP_NAME", "VietNews 24h"),
  appUrl: readEnv$1("VITE_APP_URL", "https://example.com"),
  useMockApi: String(readEnv$1("VITE_USE_MOCK_API", "false")).toLowerCase() === "true",
  allowMockFallback: String(readEnv$1("VITE_API_ALLOW_MOCK_FALLBACK", "false")).toLowerCase() === "true",
  defaultPageSize: 6,
  relatedNewsLimit: 4,
  newsCacheTtlMs: Number(readEnv$1("VITE_NEWS_CACHE_TTL_MS", 6e4)),
  fallbackImage: "/images/fallback-news.svg"
};
const categories = [
  {
    id: 1,
    name: "Thời sự",
    slug: "thoi-su",
    description: "Cập nhật nhanh các sự kiện chính trị, xã hội trong nước."
  },
  {
    id: 2,
    name: "Kinh doanh",
    slug: "kinh-doanh",
    description: "Tin tức doanh nghiệp, thị trường và xu hướng tài chính."
  },
  {
    id: 3,
    name: "Công nghệ",
    slug: "cong-nghe",
    description: "Xu hướng số, AI, thiết bị và sản phẩm công nghệ mới."
  },
  {
    id: 4,
    name: "Thế giới",
    slug: "the-gioi",
    description: "Diễn biến quốc tế nổi bật, phân tích đa chiều."
  },
  {
    id: 5,
    name: "Thể thao",
    slug: "the-thao",
    description: "Bóng đá, quần vợt, eSports và các sự kiện thể thao lớn."
  },
  {
    id: 6,
    name: "Giải trí",
    slug: "giai-tri",
    description: "Showbiz, phim ảnh, âm nhạc và đời sống sao."
  },
  {
    id: 7,
    name: "Sức khỏe",
    slug: "suc-khoe",
    description: "Kiến thức y khoa, dinh dưỡng và lối sống lành mạnh."
  },
  {
    id: 8,
    name: "Giáo dục",
    slug: "giao-duc",
    description: "Thông tin học đường, chính sách và phương pháp học tập."
  },
  {
    id: 9,
    name: "Giáo dục 2",
    slug: "giao-duc-2",
    description: "Thông tin học đường, chính sách và phương pháp học tập- 2."
  }
];
const __vite_import_meta_env__ = { "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SSR": true, "VITE_API_ALLOW_MOCK_FALLBACK": "true", "VITE_API_BASE_URL": "http://localhost:5000/api", "VITE_API_TIMEOUT": "12000", "VITE_API_WITH_CREDENTIALS": "false", "VITE_APP_NAME": "VietNews 24h", "VITE_APP_URL": "https://example.com", "VITE_AUTH_LOGIN_ENDPOINT": "/auth/login", "VITE_AUTH_LOGOUT_ENDPOINT": "/auth/logout", "VITE_AUTH_REFRESH_ENDPOINT": "/auth/refresh", "VITE_AUTH_TOKEN_TYPE": "Bearer", "VITE_NEWS_CACHE_TTL_MS": "60000", "VITE_PORT": "5173", "VITE_USE_MOCK_API": "true" };
const readEnv = (key, fallback = "") => {
  return __vite_import_meta_env__?.[key] ?? (typeof process !== "undefined" && process.env ? process.env[key] : void 0) ?? fallback;
};
const readBooleanEnv = (key, fallback = "false") => {
  return String(readEnv(key, fallback)).toLowerCase() === "true";
};
const readNumberEnv = (key, fallback) => {
  const value = Number(readEnv(key, fallback));
  return Number.isFinite(value) ? value : Number(fallback);
};
const apiConfig = {
  baseURL: readEnv("VITE_API_BASE_URL", "http://localhost:5000/api"),
  timeout: readNumberEnv("VITE_API_TIMEOUT", 12e3),
  withCredentials: readBooleanEnv("VITE_API_WITH_CREDENTIALS"),
  csrf: {
    enabled: readBooleanEnv("VITE_API_CSRF_ENABLED"),
    cookieName: readEnv("VITE_API_CSRF_COOKIE_NAME", "XSRF-TOKEN"),
    headerName: readEnv("VITE_API_CSRF_HEADER_NAME", "X-CSRF-TOKEN"),
    metaName: readEnv("VITE_API_CSRF_META_NAME", "csrf-token")
  }
};
const normalizeToken = (value) => {
  return typeof value === "string" ? value.trim() : "";
};
const normalizeExpiresAt = (payload = {}) => {
  const directExpiresAt = payload.expiresAt || payload.expires_at || payload.exp;
  const directValue = Number(directExpiresAt || 0);
  if (directValue > 0) {
    return directValue < 1e12 ? directValue * 1e3 : directValue;
  }
  const expiresIn = Number(payload.expiresIn || payload.expires_in || 0);
  return expiresIn > 0 ? Date.now() + expiresIn * 1e3 : 0;
};
const normalizeAuthPayload = (payload = {}) => {
  return {
    accessToken: normalizeToken(payload.accessToken || payload.access_token || payload.token || ""),
    refreshToken: normalizeToken(payload.refreshToken || payload.refresh_token || ""),
    expiresAt: normalizeExpiresAt(payload)
  };
};
const STATUS_MESSAGE_MAP = Object.freeze({
  400: "errors.http.400",
  401: "errors.http.401",
  403: "errors.http.403",
  404: "errors.http.404",
  408: "errors.http.408",
  429: "errors.http.429",
  500: "errors.http.500",
  502: "errors.http.502",
  503: "errors.http.503",
  504: "errors.http.504"
});
const CODE_MESSAGE_MAP = Object.freeze({
  ECONNABORTED: "errors.code.ECONNABORTED",
  ERR_NETWORK: "errors.code.ERR_NETWORK",
  ERR_CANCELED: "errors.code.ERR_CANCELED"
});
const DEFAULT_UI_MESSAGE_KEY = "errors.common.default";
const getStatusCode = (rawError) => {
  const status = Number(rawError?.status || rawError?.response?.status || 0);
  return Number.isNaN(status) ? 0 : status;
};
const getErrorCode = (rawError) => {
  return rawError?.code || rawError?.response?.data?.code || "UNKNOWN_ERROR";
};
const getTechnicalMessage = (rawError) => {
  const serverError = rawError?.response?.data?.error;
  const serverMessage = rawError?.response?.data?.message;
  if (typeof rawError?.message === "string" && rawError.message.trim()) {
    return rawError.message;
  }
  if (typeof serverError === "string" && serverError.trim()) {
    return serverError;
  }
  if (typeof serverMessage === "string" && serverMessage.trim()) {
    return serverMessage;
  }
  return "Unknown technical error";
};
const translateKey = (value = "", fallbackText = "") => {
  const key = typeof value === "string" ? value.trim() : "";
  if (!key) {
    return fallbackText;
  }
  try {
    if (i18n.global.te(key)) {
      return i18n.global.t(key);
    }
  } catch {
  }
  return key || fallbackText;
};
const resolveFallbackMessage = (fallbackMessage) => {
  const defaultMessage = translateKey(DEFAULT_UI_MESSAGE_KEY, "An unexpected error occurred.");
  return translateKey(fallbackMessage, defaultMessage);
};
const normalizeAppError = (rawError, {
  fallbackMessage = DEFAULT_UI_MESSAGE_KEY,
  context = "app"
} = {}) => {
  const status = getStatusCode(rawError);
  const code = getErrorCode(rawError);
  const fallback = resolveFallbackMessage(fallbackMessage);
  return {
    status,
    code,
    context,
    technicalMessage: getTechnicalMessage(rawError),
    message: translateKey(STATUS_MESSAGE_MAP[status]) || translateKey(CODE_MESSAGE_MAP[code]) || fallback,
    details: rawError?.response?.data || null
  };
};
const getSafeErrorMessage = (rawError, fallbackMessage = DEFAULT_UI_MESSAGE_KEY) => {
  return normalizeAppError(rawError, { fallbackMessage }).message;
};
const refreshClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: apiConfig.withCredentials,
  ...apiConfig.csrf.enabled ? {
    xsrfCookieName: apiConfig.csrf.cookieName,
    xsrfHeaderName: apiConfig.csrf.headerName
  } : {},
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  }
});
const buildRefreshPayload = (refreshToken) => {
  if (authConfig.refreshUsesCookie) {
    return {};
  }
  return { refreshToken };
};
const getCookieValue$1 = (name) => {
  {
    return "";
  }
};
const getMetaValue$1 = (name) => {
  {
    return "";
  }
};
const getCsrfToken$1 = () => {
  if (!apiConfig.csrf.enabled) {
    return "";
  }
  return getMetaValue$1() || getCookieValue$1();
};
const buildRefreshRequestConfig = () => {
  const csrfToken = getCsrfToken$1();
  if (!csrfToken) {
    return {};
  }
  return {
    headers: {
      [apiConfig.csrf.headerName]: csrfToken
    }
  };
};
const requestAccessTokenRefresh = async () => {
  const refreshToken = getRefreshToken();
  if (!authConfig.refreshUsesCookie) {
    return null;
  }
  try {
    const response = await refreshClient.post(
      authConfig.refreshEndpoint,
      buildRefreshPayload(refreshToken),
      buildRefreshRequestConfig()
    );
    const payload = response.data?.data || response.data || {};
    const session = normalizeAuthPayload(payload);
    setAuthSession({
      ...session,
      refreshToken: session.refreshToken || refreshToken
    });
    return {
      ...session,
      refreshToken: session.refreshToken || refreshToken
    };
  } catch (error) {
    throw normalizeAppError(error, {
      context: "auth:refresh",
      fallbackMessage: "errors.fallback.refreshExpired"
    });
  }
};
const SKIP_AUTH_PATTERNS = Object.freeze([/\/auth\/login$/i, /\/auth\/refresh$/i]);
const AUTH_REFRESH_RETRY_KEY = "_authRefreshRetry";
const UNSAFE_METHODS = Object.freeze(["post", "put", "patch", "delete"]);
let refreshSessionPromise = null;
const shouldSkipAuthHeader = (config) => {
  if (config?.skipAuth) {
    return true;
  }
  const requestUrl = String(config?.url || "");
  return SKIP_AUTH_PATTERNS.some((pattern) => pattern.test(requestUrl));
};
const shouldSkipAuthRefresh = (config) => {
  return Boolean(config?.skipAuthRefresh || shouldSkipAuthHeader(config));
};
const setRequestHeader = (config, name, value) => {
  if (!value) {
    return;
  }
  if (typeof config.headers?.set === "function") {
    config.headers.set(name, value);
    return;
  }
  config.headers = config.headers || {};
  config.headers[name] = value;
};
const attachAuthorizationHeader = (config) => {
  if (shouldSkipAuthHeader(config)) {
    return;
  }
  const authHeader = getAuthorizationHeader();
  if (authHeader) {
    setRequestHeader(config, "Authorization", authHeader);
  }
};
const getCookieValue = (name) => {
  {
    return "";
  }
};
const getMetaValue = (name) => {
  {
    return "";
  }
};
const getCsrfToken = () => {
  return getMetaValue() || getCookieValue();
};
const attachCsrfHeader = (config) => {
  if (!apiConfig.csrf.enabled) {
    return;
  }
  const method = String(config?.method || "get").toLowerCase();
  if (!UNSAFE_METHODS.includes(method)) {
    return;
  }
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    setRequestHeader(config, apiConfig.csrf.headerName, csrfToken);
  }
};
const refreshAccessTokenOnce = async () => {
  if (!refreshSessionPromise) {
    refreshSessionPromise = requestAccessTokenRefresh().finally(() => {
      refreshSessionPromise = null;
    });
  }
  return refreshSessionPromise;
};
const shouldRefreshBeforeRequest = (config) => {
  return !shouldSkipAuthRefresh(config) && shouldRefreshAccessToken();
};
const shouldRetryAfterUnauthorized = (error) => {
  const status = Number(error?.response?.status || 0);
  const originalRequest = error?.config || {};
  return status === 401 && !originalRequest[AUTH_REFRESH_RETRY_KEY] && !shouldSkipAuthRefresh(originalRequest) && canRefreshAccessToken();
};
const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: apiConfig.withCredentials,
  ...apiConfig.csrf.enabled ? {
    xsrfCookieName: apiConfig.csrf.cookieName,
    xsrfHeaderName: apiConfig.csrf.headerName
  } : {},
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  }
});
apiClient.interceptors.request.use(
  async (config) => {
    const nextConfig = config;
    if (shouldRefreshBeforeRequest(nextConfig)) {
      await refreshAccessTokenOnce();
    }
    attachAuthorizationHeader(nextConfig);
    attachCsrfHeader(nextConfig);
    return nextConfig;
  },
  (error) => {
    const normalizedError = normalizeAppError(error, {
      context: "api:request",
      fallbackMessage: "errors.fallback.requestInit"
    });
    return Promise.reject(normalizedError);
  }
);
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = Number(error?.response?.status || 0);
    if (shouldRetryAfterUnauthorized(error)) {
      try {
        const originalRequest = error.config;
        originalRequest[AUTH_REFRESH_RETRY_KEY] = true;
        await refreshAccessTokenOnce();
        attachAuthorizationHeader(originalRequest);
        attachCsrfHeader(originalRequest);
        return apiClient(originalRequest);
      } catch (refreshError) {
        notifyUnauthorized({
          status,
          reason: "REFRESH_FAILED"
        });
        return Promise.reject(refreshError);
      }
    }
    if (status === 401) {
      notifyUnauthorized({
        status,
        reason: "UNAUTHORIZED"
      });
    }
    const normalizedError = normalizeAppError(error, {
      context: "api:response",
      fallbackMessage: "errors.fallback.requestHandle"
    });
    return Promise.reject(normalizedError);
  }
);
const CONTROL_CHAR_PATTERN$1 = /[\u0000-\u001F\u007F]/g;
const sanitizeText = (value = "", maxLength = 220) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(CONTROL_CHAR_PATTERN$1, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
};
const toSafeInteger = (value, fallback = 0) => {
  const normalized = Number(value);
  if (Number.isNaN(normalized) || normalized < 0) {
    return fallback;
  }
  return Math.floor(normalized);
};
const normalizeCategoryItem = (item, fallbackId = 0) => {
  if (!item || typeof item !== "object") {
    return null;
  }
  const name = sanitizeText(item.name || item.title, 80);
  if (!name) {
    return null;
  }
  const slug = normalizeSlug(item.slug || name);
  if (!slug) {
    return null;
  }
  const id = toSafeInteger(item.id, fallbackId || 0) || fallbackId || 0;
  const description = sanitizeText(item.description || item.summary || "", 240);
  return {
    id,
    name,
    slug,
    description
  };
};
const normalizeCategoryList = (items = []) => {
  if (!Array.isArray(items)) {
    return [];
  }
  const seenSlugs = /* @__PURE__ */ new Set();
  const normalized = [];
  items.forEach((item, index) => {
    const mapped = normalizeCategoryItem(item, index + 1);
    if (!mapped || seenSlugs.has(mapped.slug)) {
      return;
    }
    seenSlugs.add(mapped.slug);
    normalized.push(mapped);
  });
  return normalized;
};
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));
const extractCategoriesResponse = (payload) => {
  if (Array.isArray(payload)) {
    return {
      hasValidShape: true,
      items: payload
    };
  }
  if (Array.isArray(payload?.items)) {
    return {
      hasValidShape: true,
      items: payload.items
    };
  }
  if (Array.isArray(payload?.data)) {
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
const normalizedMockCategories = normalizeCategoryList(categories);
const getCategoriesFallback = () => {
  return appConfig.allowMockFallback ? normalizedMockCategories : [];
};
const getCategoryFallbackBySlug = (slug) => {
  if (!appConfig.allowMockFallback) {
    return null;
  }
  return normalizedMockCategories.find((item) => item.slug === slug) || null;
};
const categoryService = {
  async getCategories() {
    if (appConfig.useMockApi) {
      await delay();
      return normalizedMockCategories;
    }
    try {
      const response = await apiClient.get("/categories");
      const { hasValidShape, items } = extractCategoriesResponse(response.data);
      if (!hasValidShape) {
        return getCategoriesFallback();
      }
      const normalizedCategories = normalizeCategoryList(items);
      if (items.length > 0 && normalizedCategories.length === 0) {
        return getCategoriesFallback();
      }
      return normalizedCategories;
    } catch (error) {
      return getCategoriesFallback();
    }
  },
  async getCategoryBySlug(slug) {
    const safeSlug = normalizeSlug(slug);
    if (appConfig.useMockApi) {
      await delay();
      return normalizedMockCategories.find((item) => item.slug === safeSlug) || null;
    }
    try {
      const response = await apiClient.get(`/categories/${safeSlug}`);
      const normalizedCategory = normalizeCategoryItem(response.data?.data || response.data || null);
      return normalizedCategory || null;
    } catch (error) {
      return getCategoryFallbackBySlug(safeSlug);
    }
  }
};
const useCategoryStore = defineStore("category", {
  state: () => ({
    categories: [],
    currentCategory: null,
    loading: false,
    error: "",
    cacheKeys: {
      categoriesLoaded: false,
      categorySlug: ""
    }
  }),
  getters: {
    hasCategories: (state) => state.categories.length > 0
  },
  actions: {
    async fetchCategories(forceReload = false) {
      if (this.loading) {
        return;
      }
      if (!forceReload && this.cacheKeys.categoriesLoaded && this.categories.length > 0) {
        return;
      }
      this.loading = true;
      this.error = "";
      try {
        this.categories = await categoryService.getCategories();
        this.cacheKeys.categoriesLoaded = true;
      } catch (error) {
        this.error = getSafeErrorMessage(error, "errors.fallback.categoryLoad");
        this.categories = [];
      } finally {
        this.loading = false;
      }
    },
    async fetchCategoryBySlug(slug, forceReload = false) {
      if (this.loading) {
        return this.currentCategory;
      }
      const safeSlug = String(slug || "").trim().toLowerCase();
      if (!forceReload && this.cacheKeys.categorySlug === safeSlug && this.currentCategory) {
        return this.currentCategory;
      }
      this.loading = true;
      this.error = "";
      try {
        this.currentCategory = await categoryService.getCategoryBySlug(slug);
        this.cacheKeys.categorySlug = safeSlug;
      } catch (error) {
        this.error = getSafeErrorMessage(error, "errors.fallback.categoryNotFound");
        this.currentCategory = null;
      } finally {
        this.loading = false;
      }
      return this.currentCategory;
    }
  }
});
const normalizeFieldValue = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};
const toPascalCase = (value = "") => {
  return String(value || "").replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase()).replace(/\s+/g, "");
};
const getCandidatesByLocale = (baseField, locale) => {
  const pascalField = toPascalCase(baseField);
  const lowerLocale = String(locale || "vi").toLowerCase();
  if (lowerLocale === "en") {
    return [
      `${baseField}En`,
      `${baseField}_en`,
      `${baseField}EN`,
      `en${pascalField}`
    ];
  }
  return [
    `${baseField}Vi`,
    `${baseField}_vi`,
    `${baseField}VI`,
    `vi${pascalField}`
  ];
};
const getLocalizedContent = (source, baseField, locale = "vi") => {
  if (!source || typeof source !== "object") {
    return "";
  }
  const localeCandidates = getCandidatesByLocale(baseField, locale);
  for (const fieldName of localeCandidates) {
    const localizedValue = normalizeFieldValue(source[fieldName]);
    if (localizedValue) {
      return localizedValue;
    }
  }
  if (source.translations && typeof source.translations === "object") {
    const translationByLocale = source.translations[String(locale || "vi").toLowerCase()];
    const translationValue = normalizeFieldValue(translationByLocale?.[baseField]);
    if (translationValue) {
      return translationValue;
    }
  }
  return normalizeFieldValue(source[baseField]);
};
const _sfc_main$8 = {
  __name: "AppFooter",
  __ssrInlineRender: true,
  setup(__props) {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const { t } = useI18n({ useScope: "global" });
    const { locale } = useLocale();
    const categoryStore = useCategoryStore();
    const categoriesToShow = computed(() => categoryStore.categories.slice(0, 6));
    const getCategoryName = (category) => getLocalizedContent(category, "name", locale.value);
    const loadFooterCategories = async () => {
      if (!categoryStore.hasCategories) {
        await categoryStore.fetchCategories();
      }
    };
    onServerPrefetch(loadFooterCategories);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "border-t border-slate-200 bg-white" }, _attrs))}><div class="container-wide py-10"><div class="grid gap-8 md:grid-cols-3"><section><h2 class="mb-3 text-lg font-bold text-slate-900">${ssrInterpolate(unref(t)("app.name"))}</h2><p class="text-sm leading-6 text-slate-600">${ssrInterpolate(unref(t)("footer.description"))}</p></section><section><h3 class="mb-3 text-base font-semibold text-slate-900">${ssrInterpolate(unref(t)("footer.categoryTitle"))}</h3><ul class="space-y-2 text-sm text-slate-600"><!--[-->`);
      ssrRenderList(categoriesToShow.value, (item) => {
        _push(`<li>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/danh-muc/${item.slug}`,
          class: "hover:text-brand-700"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(getCategoryName(item))}`);
            } else {
              return [
                createTextVNode(toDisplayString(getCategoryName(item)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul></section><section><h3 class="mb-3 text-base font-semibold text-slate-900">${ssrInterpolate(unref(t)("footer.contactTitle"))}</h3><ul class="space-y-2 text-sm text-slate-600"><li>${ssrInterpolate(unref(t)("contactPage.email"))}</li><li>${ssrInterpolate(unref(t)("contactPage.hotline"))}</li><li>${ssrInterpolate(unref(t)("contactPage.address"))}</li></ul></section></div><p class="mt-8 border-t border-slate-200 pt-5 text-center text-xs text-slate-500">${ssrInterpolate(unref(t)("footer.copyright", { year: unref(year) }))}</p></div></footer>`);
    };
  }
};
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/layout/AppFooter.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const _sfc_main$7 = {
  __name: "SearchBox",
  __ssrInlineRender: true,
  props: {
    modelValue: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      default: ""
    },
    inputId: {
      type: String,
      default: "search-box"
    }
  },
  emits: ["update:modelValue", "search"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t } = useI18n({ useScope: "global" });
    const keyword = ref(normalizeSearchInput(props.modelValue));
    const resolvedPlaceholder = computed(() => props.placeholder || t("common.searchPlaceholder"));
    watch(
      () => props.modelValue,
      (nextValue) => {
        keyword.value = normalizeSearchInput(nextValue);
      }
    );
    watch(keyword, (nextValue) => {
      const normalized = normalizeSearchInput(nextValue);
      if (normalized !== nextValue) {
        keyword.value = normalized;
        return;
      }
      emit("update:modelValue", normalized);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<form${ssrRenderAttrs(mergeProps({
        class: "flex w-full items-center gap-2",
        role: "search"
      }, _attrs))}><label class="sr-only"${ssrRenderAttr("for", __props.inputId)}>${ssrInterpolate(unref(t)("nav.search"))}</label><input${ssrRenderAttr("id", __props.inputId)}${ssrRenderAttr("value", keyword.value)} type="search" maxlength="120" class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"${ssrRenderAttr("placeholder", resolvedPlaceholder.value)} autocomplete="off" spellcheck="false"><button type="submit" class="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700">${ssrInterpolate(unref(t)("common.search"))}</button></form>`);
    };
  }
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/common/SearchBox.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _sfc_main$6 = {
  __name: "LanguageSwitcher",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n({ useScope: "global" });
    const { locale, locales } = useLocale();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "inline-flex items-center rounded-lg border border-slate-300 bg-white p-1" }, _attrs))}><!--[-->`);
      ssrRenderList(unref(locales), (code) => {
        _push(`<button type="button" class="${ssrRenderClass([code === unref(locale) ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-slate-100", "rounded-md px-2.5 py-1 text-xs font-semibold transition"])}"${ssrRenderAttr("aria-label", `${unref(t)("language.label")} ${unref(t)(`language.${code}`)}`)}>${ssrInterpolate(unref(t)(`language.${code}`))}</button>`);
      });
      _push(`<!--]--></div>`);
    };
  }
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/ui/LanguageSwitcher.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$5 = {
  __name: "MobileMenu",
  __ssrInlineRender: true,
  props: {
    open: {
      type: Boolean,
      default: false
    },
    categories: {
      type: Array,
      default: () => []
    }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const { t } = useI18n({ useScope: "global" });
    const { locale } = useLocale();
    const getCategoryName = (category) => getLocalizedContent(category, "name", locale.value);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<!--[-->`);
      if (__props.open) {
        _push(`<div class="fixed inset-0 z-40 bg-slate-900/40" data-v-35612b5c></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.open) {
        _push(`<aside class="fixed left-0 top-0 z-50 h-full w-80 max-w-[88%] overflow-y-auto bg-white p-5 shadow-2xl"${ssrRenderAttr("aria-label", unref(t)("mobileMenu.ariaLabel"))} data-v-35612b5c><div class="mb-4 flex items-center justify-between" data-v-35612b5c><h2 class="text-lg font-bold text-slate-900" data-v-35612b5c>${ssrInterpolate(unref(t)("nav.categories"))}</h2><button type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700" data-v-35612b5c>${ssrInterpolate(unref(t)("common.close"))}</button></div><div class="mb-4" data-v-35612b5c>`);
        _push(ssrRenderComponent(_sfc_main$6, null, null, _parent));
        _push(`</div><nav class="space-y-1" data-v-35612b5c>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/",
          class: "block rounded-lg px-3 py-2 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700",
          onClick: ($event) => emit("close")
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
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/tin-tuc",
          class: "block rounded-lg px-3 py-2 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700",
          onClick: ($event) => emit("close")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("nav.latest"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("nav.latest")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--[-->`);
        ssrRenderList(__props.categories, (item) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: item.id,
            to: `/danh-muc/${item.slug}`,
            class: "block rounded-lg px-3 py-2 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700",
            onClick: ($event) => emit("close")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(getCategoryName(item))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(getCategoryName(item)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]-->`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/gioi-thieu",
          class: "block rounded-lg px-3 py-2 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700",
          onClick: ($event) => emit("close")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("nav.about"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("nav.about")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/lien-he",
          class: "block rounded-lg px-3 py-2 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700",
          onClick: ($event) => emit("close")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("nav.contact"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("nav.contact")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</nav></aside>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/layout/MobileMenu.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const MobileMenu = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-35612b5c"]]);
const getInitialLocale = () => {
  {
    return DEFAULT_LOCALE;
  }
};
const useAppStore = defineStore("app", {
  state: () => ({
    appName: appConfig.appName,
    locale: getInitialLocale(),
    isMobileMenuOpen: false,
    globalLoading: false,
    authExpired: false,
    isAuthenticated: false
  }),
  actions: {
    setMobileMenu(value) {
      this.isMobileMenuOpen = Boolean(value);
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    setGlobalLoading(value) {
      this.globalLoading = Boolean(value);
    },
    setLocale(locale) {
      this.locale = String(locale || DEFAULT_LOCALE).toLowerCase();
    },
    setAuthenticated(value) {
      this.isAuthenticated = Boolean(value);
    },
    markAuthExpired(value = true) {
      this.authExpired = Boolean(value);
    }
  }
});
const _sfc_main$4 = {
  __name: "AppHeader",
  __ssrInlineRender: true,
  setup(__props) {
    const appStore = useAppStore();
    const categoryStore = useCategoryStore();
    const route = useRoute$1();
    const router = useRouter$1();
    const { t } = useI18n({ useScope: "global" });
    const { locale } = useLocale();
    const categories2 = computed(() => categoryStore.categories);
    const searchKeyword = ref("");
    watch(
      () => locale.value,
      (nextLocale) => {
        appStore.setLocale(nextLocale);
      },
      { immediate: true }
    );
    watch(
      () => route.query.q,
      (value) => {
        searchKeyword.value = value ? normalizeSearchInput(String(value)) : "";
      },
      { immediate: true }
    );
    const loadHeaderCategories = async () => {
      if (!categoryStore.hasCategories) {
        await categoryStore.fetchCategories();
      }
    };
    onServerPrefetch(loadHeaderCategories);
    const handleSearch = (value) => {
      const safeQuery = normalizeSearchInput(value);
      router.push({
        path: "/tim-kiem",
        query: safeQuery ? { q: safeQuery } : {}
      });
      appStore.setMobileMenu(false);
    };
    const getCategoryName = (category) => getLocalizedContent(category, "name", locale.value);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur" }, _attrs))}><div class="container-wide"><div class="flex items-center justify-between gap-4 py-3"><div class="flex items-center gap-3"><button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 lg:hidden"${ssrRenderAttr("aria-label", unref(t)("header.menuAria"))}><span class="text-xl leading-none">☰</span></button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex items-center gap-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="rounded-lg bg-brand-600 px-2.5 py-1 text-sm font-bold text-white"${_scopeId}>VN</span><span class="text-lg font-bold text-slate-900"${_scopeId}>${ssrInterpolate(unref(appStore).appName)}</span>`);
          } else {
            return [
              createVNode("span", { class: "rounded-lg bg-brand-600 px-2.5 py-1 text-sm font-bold text-white" }, "VN"),
              createVNode("span", { class: "text-lg font-bold text-slate-900" }, toDisplayString(unref(appStore).appName), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="hidden min-w-0 flex-1 lg:block">`);
      _push(ssrRenderComponent(_sfc_main$7, {
        modelValue: searchKeyword.value,
        "onUpdate:modelValue": ($event) => searchKeyword.value = $event,
        "input-id": "header-search",
        placeholder: unref(t)("header.searchPlaceholder"),
        onSearch: handleSearch
      }, null, _parent));
      _push(`</div><div class="hidden lg:block">`);
      _push(ssrRenderComponent(_sfc_main$6, null, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/tim-kiem",
        class: "inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-400 hover:text-brand-700 lg:hidden"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("nav.search"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("nav.search")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><nav class="hidden items-center gap-1 overflow-x-auto whitespace-nowrap border-t border-slate-100 py-2 lg:flex">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700",
        "active-class": "bg-brand-600 text-white hover:bg-brand-600 hover:text-white"
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
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/tin-tuc",
        class: "rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700",
        "active-class": "bg-brand-600 text-white hover:bg-brand-600 hover:text-white"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("nav.latest"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("nav.latest")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--[-->`);
      ssrRenderList(categories2.value, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.id,
          to: `/danh-muc/${item.slug}`,
          class: "rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700",
          "active-class": "bg-brand-600 text-white hover:bg-brand-600 hover:text-white"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(getCategoryName(item))}`);
            } else {
              return [
                createTextVNode(toDisplayString(getCategoryName(item)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/gioi-thieu",
        class: "rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700",
        "active-class": "bg-brand-600 text-white hover:bg-brand-600 hover:text-white"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("nav.about"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("nav.about")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/lien-he",
        class: "rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700",
        "active-class": "bg-brand-600 text-white hover:bg-brand-600 hover:text-white"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("nav.contact"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("nav.contact")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav></div>`);
      _push(ssrRenderComponent(MobileMenu, {
        open: unref(appStore).isMobileMenuOpen,
        categories: categories2.value,
        onClose: ($event) => unref(appStore).setMobileMenu(false)
      }, null, _parent));
      _push(`</header>`);
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/layout/AppHeader.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const CONTROL_CHAR_PATTERN = /[\u0000-\u001F\u007F]/g;
const TAG_PATTERN = /<[^>]*>/g;
const SCHEMA_SCRIPT_PREFIX = "seo-schema-";
const sanitizeMetaText = (value = "", maxLength = 320) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(CONTROL_CHAR_PATTERN, " ").replace(TAG_PATTERN, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
};
const sanitizeUrl = (value = "", fallbackPath = "") => {
  if (!value || typeof value !== "string") {
    if (!fallbackPath) {
      return "";
    }
    return sanitizeUrl(fallbackPath);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  try {
    const normalized = new URL(trimmed, appConfig.appUrl);
    if (!["http:", "https:"].includes(normalized.protocol)) {
      return "";
    }
    return normalized.toString();
  } catch {
    return "";
  }
};
const tryUseHead = (payload) => {
  try {
    useHead(payload);
    return true;
  } catch {
    return false;
  }
};
const createMetaByName = (name, content) => {
  const safeContent = sanitizeMetaText(content);
  if (!safeContent) {
    return null;
  }
  return {
    key: `meta-name-${name}`,
    name,
    content: safeContent
  };
};
const createMetaByProperty = (property, content) => {
  const safeContent = sanitizeMetaText(content);
  if (!safeContent) {
    return null;
  }
  return {
    key: `meta-property-${property}`,
    property,
    content: safeContent
  };
};
const createLink = (link) => {
  if (!link?.href) {
    return null;
  }
  const safeHref = sanitizeUrl(link.href);
  if (!safeHref) {
    return null;
  }
  return {
    ...link,
    href: safeHref
  };
};
const resolveHeadSource = (source) => {
  if (typeof source === "function") {
    return source();
  }
  return unref(source);
};
const buildSeoHeadPayload = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  robots = "index, follow",
  twitterCard = "summary_large_image",
  locale = DEFAULT_LOCALE,
  alternates = [],
  canonical
} = {}) => {
  const safeLocale = String(locale || DEFAULT_LOCALE).toLowerCase();
  const safeTitle = sanitizeMetaText(title, 80);
  const safeDescription = sanitizeMetaText(description, 320);
  const canonicalUrl = sanitizeUrl(canonical);
  const safeOgImage = sanitizeUrl(ogImage, "/images/og-default.svg");
  const safeOgLocale = sanitizeMetaText(
    String(HREFLANG_MAP[safeLocale] || HREFLANG_MAP[DEFAULT_LOCALE] || "vi-VN").replace("-", "_"),
    40
  );
  const ogLocaleAlternates = SUPPORTED_LOCALES.filter((item) => item !== safeLocale).map((item) => String(HREFLANG_MAP[item] || "").replace("-", "_")).filter(Boolean);
  return {
    title: safeTitle || void 0,
    htmlAttrs: {
      lang: safeLocale
    },
    meta: [
      createMetaByName("description", safeDescription),
      createMetaByName("keywords", keywords),
      createMetaByName("robots", robots),
      createMetaByProperty("og:type", sanitizeMetaText(ogType, 40) || "website"),
      createMetaByProperty("og:url", canonicalUrl),
      createMetaByProperty("og:title", ogTitle || safeTitle),
      createMetaByProperty("og:description", ogDescription || safeDescription),
      createMetaByProperty("og:image", safeOgImage),
      createMetaByProperty("og:image:alt", ogTitle || safeTitle),
      createMetaByProperty("og:site_name", appConfig.appName),
      createMetaByProperty("og:locale", safeOgLocale),
      ...ogLocaleAlternates.map((localeValue, index) => ({
        key: `meta-property-og-locale-alternate-${index}`,
        property: "og:locale:alternate",
        content: sanitizeMetaText(localeValue, 40)
      })).filter((item) => item.content),
      createMetaByName("twitter:card", twitterCard),
      createMetaByName("twitter:title", ogTitle || safeTitle),
      createMetaByName("twitter:description", ogDescription || safeDescription),
      createMetaByName("twitter:image", safeOgImage)
    ].filter(Boolean),
    link: [
      createLink({
        key: "canonical",
        rel: "canonical",
        href: canonicalUrl
      }),
      ...alternates.map((item, index) => createLink({
        key: `alternate-${index}-${item?.hreflang || ""}`,
        rel: "alternate",
        hreflang: sanitizeMetaText(item?.hreflang || "", 40),
        href: item?.href || ""
      }))
    ].filter(Boolean)
  };
};
const normalizeStructuredDataEntries = (entries = []) => {
  if (!Array.isArray(entries)) {
    return [];
  }
  return entries.filter((entry2) => entry2?.id && entry2?.schema && typeof entry2.schema === "object").map((entry2) => {
    const scriptId = `${SCHEMA_SCRIPT_PREFIX}${sanitizeMetaText(String(entry2.id), 80)}`;
    return {
      key: scriptId,
      id: scriptId,
      type: "application/ld+json",
      children: JSON.stringify(entry2.schema)
    };
  });
};
const normalizeQueryValue = (value) => {
  if (value === void 0 || value === null) {
    return "";
  }
  return sanitizeMetaText(String(value), 100);
};
const buildCanonicalUrl = (path = "", query = {}) => {
  const url = new URL(appConfig.appUrl);
  const safePath = String(path || "/").startsWith("/") ? String(path || "/") : `/${path}`;
  url.pathname = safePath;
  url.hash = "";
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => {
    const safeKey = sanitizeMetaText(String(key), 40);
    const safeValue = normalizeQueryValue(value);
    if (safeKey && safeValue) {
      params.set(safeKey, safeValue);
    }
  });
  url.search = params.toString();
  return url.toString();
};
const buildLocalizedCanonicalUrl = (path = "", locale = DEFAULT_LOCALE, query = {}) => {
  const safeLocale = String(locale || DEFAULT_LOCALE).toLowerCase();
  if (safeLocale === DEFAULT_LOCALE) {
    return buildCanonicalUrl(path, query);
  }
  return buildCanonicalUrl(path, {
    ...query,
    lang: safeLocale
  });
};
const buildAlternateLocaleLinks = (path = "", query = {}) => {
  const alternateLinks = SUPPORTED_LOCALES.map((locale) => ({
    hreflang: HREFLANG_MAP[locale],
    href: buildLocalizedCanonicalUrl(path, locale, query)
  }));
  alternateLinks.push({
    hreflang: FALLBACK_HREFLANG,
    href: buildLocalizedCanonicalUrl(path, DEFAULT_LOCALE, query)
  });
  return alternateLinks;
};
const buildAbsoluteUrl = (value = "") => {
  return sanitizeUrl(value);
};
const useSeoHead = (metaSource) => {
  return tryUseHead(() => buildSeoHeadPayload(resolveHeadSource(metaSource) || {}));
};
const useStructuredDataHead = (entriesSource) => {
  return tryUseHead(() => ({
    script: normalizeStructuredDataEntries(resolveHeadSource(entriesSource) || [])
  }));
};
const setStructuredData = (schemaId, schemaObject) => {
  if (!schemaObject || typeof schemaObject !== "object") {
    return;
  }
  const scriptId = `${SCHEMA_SCRIPT_PREFIX}${schemaId}`;
  const json = JSON.stringify(schemaObject);
  if (tryUseHead({
    script: [
      {
        key: scriptId,
        id: scriptId,
        type: "application/ld+json",
        children: json
      }
    ]
  })) {
    return;
  }
  {
    return;
  }
};
const updateSeoMeta = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  robots = "index, follow",
  twitterCard = "summary_large_image",
  locale = DEFAULT_LOCALE,
  alternates = [],
  canonical
}) => {
  {
    tryUseHead(buildSeoHeadPayload({
      title,
      description,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      ogType,
      robots,
      twitterCard,
      locale,
      alternates,
      canonical
    }));
    return;
  }
};
const setDefaultSeoMeta = (meta = {}) => {
  updateSeoMeta({
    title: `${appConfig.appName} - Tin tức mới nhất mỗi ngày`,
    description: "Trang tin tổng hợp cập nhật liên tục, nội dung chọn lọc và dễ đọc trên mọi thiết bị.",
    keywords: "tin tức, tin nóng, thời sự, công nghệ, kinh doanh",
    canonical: buildCanonicalUrl("/"),
    ...meta
  });
};
const _sfc_main$3 = {
  __name: "MainLayout",
  __ssrInlineRender: true,
  setup(__props) {
    const appStore = useAppStore();
    const { t } = useI18n({ useScope: "global" });
    const applyWebsiteStructuredData = () => {
      setStructuredData("website", {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: appStore.appName,
        url: buildCanonicalUrl("/"),
        potentialAction: {
          "@type": "SearchAction",
          target: `${buildCanonicalUrl("/tim-kiem")}?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      });
    };
    applyWebsiteStructuredData();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-slate-50" }, _attrs))}>`);
      if (unref(appStore).authExpired) {
        _push(`<div class="border-b border-amber-300 bg-amber-50" role="status" aria-live="polite"><div class="container-wide flex items-center justify-between gap-3 py-2 text-sm text-amber-900"><p>${ssrInterpolate(unref(t)("auth.expiredMessage"))}</p><button type="button" class="rounded-md border border-amber-400 px-2 py-1 text-xs font-medium hover:bg-amber-100">${ssrInterpolate(unref(t)("common.close"))}</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_sfc_main$4, null, null, _parent));
      _push(`<main class="pb-8">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      _push(ssrRenderComponent(_sfc_main$8, null, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/layouts/MainLayout.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = {
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    const { t, locale } = useI18n({ useScope: "global" });
    const applyDefaultSeo = () => {
      setDefaultSeoMeta({
        title: t("seo.default.title"),
        description: t("seo.default.description"),
        keywords: t("seo.default.keywords"),
        canonical: buildLocalizedCanonicalUrl("/", locale.value),
        locale: locale.value,
        alternates: buildAlternateLocaleLinks("/")
      });
    };
    applyDefaultSeo();
    watch(
      () => locale.value,
      () => applyDefaultSeo()
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtPage = __nuxt_component_0;
      _push(ssrRenderComponent(_sfc_main$3, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtPage, null, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtPage)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    const status = Number(_error.statusCode || 500);
    const is404 = status === 404;
    const statusText = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-CR2Cvo2N.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500-CZ9b0osm.mjs'));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ status: unref(status), statusText: unref(statusText), statusCode: unref(status), statusMessage: unref(statusText), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup", []);
    const error = /* @__PURE__ */ useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    function invokeAppErrorHandler(err, target, info) {
      const errorHandler = nuxtApp.vueApp.config.errorHandler;
      if (errorHandler && !errorHandler.__nuxt_default) {
        try {
          errorHandler(err, target, info);
        } catch (handlerError) {
          console.error("[nuxt] Error in `app.config.errorHandler`", handlerError);
        }
      }
    }
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        invokeAppErrorHandler(err, target, info);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(_sfc_main$2), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error ||= createError(error);
    }
    if (ssrContext && (ssrContext["~renderResponse"] || ssrContext._renderResponse)) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry_default = ((ssrContext) => entry(ssrContext));

export { _export_sfc as _, __nuxt_component_0$1 as a, buildNewsPath as b, appConfig as c, useCategoryStore as d, entry_default as default, buildLocalizedCanonicalUrl as e, buildAlternateLocaleLinks as f, getLocalizedContent as g, useSeoHead as h, useStructuredDataHead as i, updateSeoMeta as j, _sfc_main$7 as k, buildCategoryPath as l, generateSlug as m, normalizeSearchInput as n, sanitizeHtml as o, buildCanonicalUrl as p, buildAbsoluteUrl as q, normalizeSlug as r, setResponseStatus as s, apiClient as t, useHead as u, normalizeCategoryList as v, categoryService as w, categories as x, getSafeErrorMessage as y };
//# sourceMappingURL=server.mjs.map
