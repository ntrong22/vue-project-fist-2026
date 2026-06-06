import { defineStore } from 'pinia';
import appConfig from '@/config/appConfig';
import newsService from '@/services/newsService';
import { getSafeErrorMessage } from '@/utils/errorHandler';
import { normalizeSearchInput } from '@/utils/sanitizeHtml';

export const useNewsStore = defineStore('news', {
  state: () => ({
    homeData: {
      featured: [],
      latest: [],
      popular: [],
      hot: [],
      categorySections: [],
      sidebar: {
        topReads: [],
        hotPicks: [],
      },
    },
    categoryNews: {
      category: null,
      items: [],
      pagination: {
        page: 1,
        pageSize: appConfig.defaultPageSize,
        totalItems: 0,
        totalPages: 1,
      },
      sidebarItems: [],
    },
    newsList: {
      items: [],
      pagination: {
        page: 1,
        pageSize: appConfig.defaultPageSize,
        totalItems: 0,
        totalPages: 1,
      },
      sidebarItems: [],
    },
    newsDetail: null,
    relatedNews: [],
    searchResult: {
      query: '',
      items: [],
      pagination: {
        page: 1,
        pageSize: appConfig.defaultPageSize,
        totalItems: 0,
        totalPages: 1,
      },
    },
    loading: {
      home: false,
      category: false,
      list: false,
      detail: false,
      search: false,
    },
    error: {
      home: '',
      category: '',
      list: '',
      detail: '',
      search: '',
    },
    cacheKeys: {
      homeLoaded: false,
      category: '',
      list: '',
      search: '',
    },
  }),

  actions: {
    async fetchHomeNews(forceReload = false) {
      if (this.loading.home) {
        return;
      }

      if (!forceReload && this.cacheKeys.homeLoaded) {
        return;
      }

      this.loading.home = true;
      this.error.home = '';

      try {
        this.homeData = await newsService.getHomeNewsData();
        this.cacheKeys.homeLoaded = true;
      } catch (error) {
        this.error.home = getSafeErrorMessage(error, 'errors.fallback.homeLoad');
      } finally {
        this.loading.home = false;
      }
    },

    async fetchCategoryNews(slug, page = 1, forceReload = false) {
      if (this.loading.category) {
        return;
      }

      const requestKey = `${String(slug || '')}|${Number(page || 1)}|${this.categoryNews.pagination.pageSize}`;

      if (!forceReload && this.cacheKeys.category === requestKey && this.categoryNews.items.length > 0) {
        return;
      }

      this.loading.category = true;
      this.error.category = '';

      try {
        this.categoryNews = await newsService.getNewsByCategorySlug(
          slug,
          page,
          this.categoryNews.pagination.pageSize,
        );
        this.cacheKeys.category = requestKey;
      } catch (error) {
        this.error.category = getSafeErrorMessage(
          error,
          'errors.fallback.categoryNewsLoad',
        );
        this.categoryNews.items = [];
      } finally {
        this.loading.category = false;
      }
    },

    async fetchNewsList(page = 1, forceReload = false) {
      if (this.loading.list) {
        return;
      }

      const requestKey = `${Number(page || 1)}|${this.newsList.pagination.pageSize}`;

      if (!forceReload && this.cacheKeys.list === requestKey && this.newsList.items.length > 0) {
        return;
      }

      this.loading.list = true;
      this.error.list = '';

      try {
        this.newsList = await newsService.getNewsList(page, this.newsList.pagination.pageSize);
        this.cacheKeys.list = requestKey;
      } catch (error) {
        this.error.list = getSafeErrorMessage(error, 'errors.fallback.newsListLoad');
        this.newsList.items = [];
      } finally {
        this.loading.list = false;
      }
    },

    async fetchNewsDetail(slug) {
      this.loading.detail = true;
      this.error.detail = '';
      this.newsDetail = null;
      this.relatedNews = [];

      try {
        this.newsDetail = await newsService.getNewsDetailBySlug(slug);

        if (this.newsDetail) {
          this.relatedNews = await newsService.getRelatedNews(this.newsDetail);
        }
      } catch (error) {
        this.error.detail = getSafeErrorMessage(error, 'errors.fallback.newsDetailLoad');
      } finally {
        this.loading.detail = false;
      }

      return this.newsDetail;
    },

    async searchNews(query, page = 1, forceReload = false) {
      if (this.loading.search) {
        return;
      }

      this.loading.search = true;
      this.error.search = '';

      const safeQuery = normalizeSearchInput(query);
      const requestKey = `${safeQuery}|${Number(page || 1)}|${this.searchResult.pagination.pageSize}`;

      try {
        if (
          !forceReload &&
          this.cacheKeys.search === requestKey &&
          this.searchResult.query === safeQuery
        ) {
          return;
        }

        if (!safeQuery) {
          this.searchResult = {
            query: '',
            items: [],
            pagination: {
              page: 1,
              pageSize: this.searchResult.pagination.pageSize,
              totalItems: 0,
              totalPages: 1,
            },
          };
          this.cacheKeys.search = '';
          return;
        }

        this.searchResult = await newsService.searchNews(
          safeQuery,
          page,
          this.searchResult.pagination.pageSize,
        );
        this.cacheKeys.search = requestKey;
      } catch (error) {
        this.error.search = getSafeErrorMessage(error, 'errors.fallback.searchLoad');
      } finally {
        this.loading.search = false;
      }
    },

    clearNewsDetail() {
      this.newsDetail = null;
      this.relatedNews = [];
      this.error.detail = '';
    },
  },
});

export default useNewsStore;
