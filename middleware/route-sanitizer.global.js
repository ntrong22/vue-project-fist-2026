import { hasValidAccessToken } from '@/services/authSession';
import { normalizeSearchInput } from '@/utils/sanitizeHtml';
import { normalizeSlug } from '@/utils/slugHelper';

const sanitizePageQuery = (value) => {
  const normalized = Number(value);

  if (Number.isNaN(normalized) || normalized < 2) {
    return '';
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

export default defineNuxtRouteMiddleware((to) => {
  if (to.meta?.requiresAuth && !hasValidAccessToken()) {
    return navigateTo({
      path: '/',
      query: {
        redirect: to.fullPath,
      },
    }, { replace: true });
  }

  const nextQuery = { ...to.query };
  let shouldRedirectByQuery = false;

  if (Object.prototype.hasOwnProperty.call(nextQuery, 'page')) {
    const safePage = sanitizePageQuery(nextQuery.page);

    if (!safePage) {
      delete nextQuery.page;
      shouldRedirectByQuery = true;
    } else if (safePage !== String(nextQuery.page)) {
      nextQuery.page = safePage;
      shouldRedirectByQuery = true;
    }
  }

  if (to.path === '/tim-kiem' && Object.prototype.hasOwnProperty.call(nextQuery, 'q')) {
    const safeQuery = normalizeSearchInput(String(nextQuery.q || ''));

    if (!safeQuery) {
      delete nextQuery.q;
      shouldRedirectByQuery = true;
    } else if (safeQuery !== String(nextQuery.q)) {
      nextQuery.q = safeQuery;
      shouldRedirectByQuery = true;
    }
  }

  const isCategoryDetail = to.path.startsWith('/danh-muc/');
  const isNewsDetail = to.path.startsWith('/tin-tuc/') && to.path !== '/tin-tuc';

  if ((isCategoryDetail || isNewsDetail) && to.params?.slug) {
    const rawSlug = String(Array.isArray(to.params.slug) ? to.params.slug[0] : to.params.slug || '');
    const safeSlug = normalizeSlug(rawSlug);

    if (!safeSlug && rawSlug) {
      return navigateTo('/404', { replace: true });
    }

    if (safeSlug && safeSlug !== rawSlug) {
      return navigateTo({
        path: buildPathWithSlug(to.path, rawSlug, safeSlug),
        query: nextQuery,
        hash: to.hash,
      }, { replace: true });
    }
  }

  if (shouldRedirectByQuery) {
    return navigateTo({
      path: to.path,
      query: nextQuery,
      hash: to.hash,
    }, { replace: true });
  }

  return true;
});
