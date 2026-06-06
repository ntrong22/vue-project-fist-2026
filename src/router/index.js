import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import { hasValidAccessToken } from '@/services/authSession';
import { normalizeSearchInput } from '@/utils/sanitizeHtml';
import { normalizeSlug } from '@/utils/slugHelper';

const NotFoundView = () => import('@/pages/NotFoundView.vue');

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/HomeView.vue'),
        meta: {
          breadcrumbKey: 'nav.home',
        },
      },
      {
        path: 'danh-muc/:slug',
        name: 'category',
        component: () => import('@/pages/CategoryView.vue'),
        meta: {
          breadcrumbKey: 'common.category',
        },
      },
      {
        path: 'tin-tuc',
        name: 'news-list',
        component: () => import('@/pages/NewsListView.vue'),
        meta: {
          breadcrumbKey: 'news.latest',
        },
      },
      {
        path: 'tin-tuc/:slug',
        name: 'news-detail',
        component: () => import('@/pages/NewsDetailView.vue'),
        meta: {
          breadcrumbKey: 'news.related',
        },
      },
      {
        path: 'tim-kiem',
        name: 'search',
        component: () => import('@/pages/SearchView.vue'),
        meta: {
          breadcrumbKey: 'searchPage.breadcrumb',
          noindex: true,
        },
      },
      {
        path: 'gioi-thieu',
        name: 'about',
        component: () => import('@/pages/AboutView.vue'),
        meta: {
          breadcrumbKey: 'aboutPage.breadcrumb',
        },
      },
      {
        path: 'lien-he',
        name: 'contact',
        component: () => import('@/pages/ContactView.vue'),
        meta: {
          breadcrumbKey: 'contactPage.breadcrumb',
        },
      },
      {
        path: '404',
        name: 'not-found',
        component: NotFoundView,
        meta: {
          noindex: true,
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'not-found-catchall',
        component: NotFoundView,
        meta: {
          noindex: true,
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    return { top: 0, behavior: 'smooth' };
  },
});

const sanitizePageQuery = (value) => {
  const normalized = Number(value);

  if (Number.isNaN(normalized) || normalized < 2) {
    return '';
  }

  return String(Math.floor(normalized));
};

const buildRedirectLocation = (to, overrides = {}) => {
  if (to.name) {
    return {
      name: to.name,
      params: overrides.params || to.params,
      query: overrides.query || to.query,
      hash: to.hash,
      replace: true,
    };
  }

  return {
    path: to.path,
    query: overrides.query || to.query,
    hash: to.hash,
    replace: true,
  };
};

router.beforeEach((to) => {
  if (to.meta?.requiresAuth && !hasValidAccessToken()) {
    return {
      name: 'home',
      query: {
        redirect: to.fullPath,
      },
      replace: true,
    };
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

  if (to.name === 'search' && Object.prototype.hasOwnProperty.call(nextQuery, 'q')) {
    const safeQuery = normalizeSearchInput(String(nextQuery.q || ''));

    if (!safeQuery) {
      delete nextQuery.q;
      shouldRedirectByQuery = true;
    } else if (safeQuery !== String(nextQuery.q)) {
      nextQuery.q = safeQuery;
      shouldRedirectByQuery = true;
    }
  }

  if (to.name === 'category' || to.name === 'news-detail') {
    const rawSlug = String(to.params.slug || '');
    const safeSlug = normalizeSlug(rawSlug);

    if (!safeSlug && rawSlug) {
      return {
        name: 'not-found',
        replace: true,
      };
    }

    if (safeSlug && safeSlug !== rawSlug) {
      return buildRedirectLocation(to, {
        params: {
          ...to.params,
          slug: safeSlug,
        },
        query: nextQuery,
      });
    }
  }

  if (shouldRedirectByQuery) {
    return buildRedirectLocation(to, {
      query: nextQuery,
    });
  }

  return true;
});

export default router;
