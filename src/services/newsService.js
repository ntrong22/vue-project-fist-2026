import appConfig from '@/config/appConfig';
import categoriesMock from '@/data/categories';
import newsMock from '@/data/news';
import apiClient from '@/api/httpClient';
import categoryService from '@/services/categoryService';
import { normalizeCategoryList } from '@/services/categoryMapper';
import { normalizeNewsList } from '@/services/newsMapper';
import { sortByPublishedAtDesc } from '@/utils/dateHelper';
import { logTechnicalError } from '@/utils/errorHandler';
import { normalizeSearchInput } from '@/utils/sanitizeHtml';
import { normalizeSlug } from '@/utils/slugHelper';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const paginate = (items = [], page = 1, pageSize = appConfig.defaultPageSize) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safePageSize = Math.max(Number(pageSize) || appConfig.defaultPageSize, 1);
  const totalItems = items.length;
  const totalPages = Math.max(Math.ceil(totalItems / safePageSize), 1);
  const currentPage = Math.min(safePage, totalPages);
  const start = (currentPage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    pagination: {
      page: currentPage,
      pageSize: safePageSize,
      totalItems,
      totalPages,
    },
  };
};

const extractListResponse = (payload) => {
  if (Array.isArray(payload)) {
    return {
      hasValidShape: true,
      items: payload,
    };
  }

  if (Array.isArray(payload?.items)) {
    return {
      hasValidShape: true,
      items: payload.items,
    };
  }

  if (Array.isArray(payload?.data)) {
    return {
      hasValidShape: true,
      items: payload.data,
    };
  }

  return {
    hasValidShape: false,
    items: [],
  };
};

const normalizedCategories = normalizeCategoryList(categoriesMock);
const normalizedMockNews = normalizeNewsList(newsMock, normalizedCategories);

const getSortedMockNews = () => sortByPublishedAtDesc(normalizedMockNews);

const getCategoriesFallback = () => {
  return appConfig.allowMockFallback ? [...normalizedCategories] : [];
};

const getNewsFallback = () => {
  return appConfig.allowMockFallback ? getSortedMockNews() : [];
};

const categoryCache = {
  items: [...normalizedCategories],
  expiresAt: 0,
  pending: null,
};

const newsCache = {
  items: [],
  expiresAt: 0,
  pending: null,
};

const getCacheTtl = () => Math.max(Number(appConfig.newsCacheTtlMs || 0), 0);

const isCacheAvailable = () => {
  return Array.isArray(newsCache.items) && newsCache.items.length > 0 && Date.now() < newsCache.expiresAt;
};

const saveNewsCache = (items) => {
  newsCache.items = Array.isArray(items) ? [...items] : [];
  newsCache.expiresAt = Date.now() + getCacheTtl();
};

const clearNewsCache = () => {
  newsCache.items = [];
  newsCache.expiresAt = 0;
  newsCache.pending = null;
};

const isCategoryCacheAvailable = () => {
  return (
    Array.isArray(categoryCache.items) &&
    categoryCache.items.length > 0 &&
    Date.now() < categoryCache.expiresAt
  );
};

const saveCategoryCache = (items) => {
  categoryCache.items = Array.isArray(items) ? [...items] : getCategoriesFallback();
  categoryCache.expiresAt = Date.now() + getCacheTtl();
};

const getAvailableCategories = async () => {
  if (appConfig.useMockApi) {
    return [...normalizedCategories];
  }

  if (isCategoryCacheAvailable()) {
    return [...categoryCache.items];
  }

  if (categoryCache.pending) {
    return categoryCache.pending;
  }

  categoryCache.pending = (async () => {
    try {
      const categories = await categoryService.getCategories();
      if (Array.isArray(categories) && categories.length > 0) {
        saveCategoryCache(categories);
        return [...categories];
      }
    } catch (error) {
      logTechnicalError(error, 'newsService:getAvailableCategories');
    } finally {
      categoryCache.pending = null;
    }

    const fallbackCategories = getCategoriesFallback();
    saveCategoryCache(fallbackCategories);
    return fallbackCategories;
  })();

  return categoryCache.pending;
};

const getAllNews = async () => {
  if (isCacheAvailable()) {
    return [...newsCache.items];
  }

  if (newsCache.pending) {
    return newsCache.pending;
  }

  newsCache.pending = (async () => {
    if (appConfig.useMockApi) {
      await delay();
      const mockNews = getSortedMockNews();
      saveNewsCache(mockNews);
      return mockNews;
    }

    try {
      const response = await apiClient.get('/news');
      const { hasValidShape, items } = extractListResponse(response.data);
      const availableCategories = await getAvailableCategories();

      if (!hasValidShape) {
        const fallbackNews = getNewsFallback();
        saveNewsCache(fallbackNews);
        return fallbackNews;
      }

      const normalizedNews = normalizeNewsList(items, availableCategories);

      if (items.length > 0 && normalizedNews.length === 0) {
        const fallbackNews = getNewsFallback();
        saveNewsCache(fallbackNews);
        return fallbackNews;
      }

      const sortedNews = sortByPublishedAtDesc(normalizedNews);
      saveNewsCache(sortedNews);
      return sortedNews;
    } catch (error) {
      logTechnicalError(error, 'newsService:getAllNews');
      const fallbackNews = getNewsFallback();
      saveNewsCache(fallbackNews);
      return fallbackNews;
    } finally {
      newsCache.pending = null;
    }
  })();

  return newsCache.pending;
};

const getCategoryBySlug = (slug) => {
  const safeSlug = normalizeSlug(slug);
  return categoryCache.items.find((item) => item.slug === safeSlug) || null;
};

export const newsService = {
  clearCache() {
    clearNewsCache();
    categoryCache.expiresAt = 0;
    categoryCache.pending = null;
  },

  async getNewsList(page = 1, pageSize = appConfig.defaultPageSize) {
    const allNews = await getAllNews();
    const paginated = paginate(allNews, page, pageSize);
    const sidebarItems = [...allNews].sort((a, b) => b.viewCount - a.viewCount).slice(0, 6);

    return {
      items: paginated.items,
      pagination: paginated.pagination,
      sidebarItems,
    };
  },

  async getHomeNewsData() {
    const allNews = await getAllNews();

    const featured = allNews.filter((item) => item.isFeatured).slice(0, 4);
    const latest = allNews.slice(0, 12);
    const popular = [...allNews].sort((a, b) => b.viewCount - a.viewCount).slice(0, 8);
    const hot = allNews.filter((item) => item.isHot).slice(0, 8);

    const categorySections = normalizedCategories.map((category) => ({
      category,
      items: allNews.filter((item) => item.categoryId === category.id).slice(0, 4),
    }));

    return {
      featured,
      latest,
      popular,
      hot,
      categorySections,
      sidebar: {
        topReads: popular.slice(0, 5),
        hotPicks: hot.slice(0, 5),
      },
    };
  },

  async getNewsByCategorySlug(slug, page = 1, pageSize = appConfig.defaultPageSize) {
    const allNews = await getAllNews();
    const category = getCategoryBySlug(slug);

    if (!category) {
      return {
        category: null,
        items: [],
        pagination: {
          page: 1,
          pageSize,
          totalItems: 0,
          totalPages: 1,
        },
      };
    }

    const filtered = allNews.filter((item) => item.categoryId === category.id);
    const paginated = paginate(filtered, page, pageSize);
    const sidebarItems = [...filtered].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

    return {
      category,
      items: paginated.items,
      pagination: paginated.pagination,
      sidebarItems,
    };
  },

  async getNewsDetailBySlug(slug) {
    const allNews = await getAllNews();
    const safeSlug = normalizeSlug(slug);

    return allNews.find((item) => normalizeSlug(item.slug) === safeSlug) || null;
  },

  async getRelatedNews(newsItem, limit = appConfig.relatedNewsLimit) {
    if (!newsItem) {
      return [];
    }

    const allNews = await getAllNews();

    return allNews
      .filter((item) => item.id !== newsItem.id && item.categoryId === newsItem.categoryId)
      .slice(0, limit);
  },

  async searchNews(query, page = 1, pageSize = appConfig.defaultPageSize) {
    const allNews = await getAllNews();
    const rawKeyword = normalizeSearchInput(query);
    const keyword = rawKeyword.toLowerCase();

    if (!rawKeyword) {
      return {
        query: '',
        items: [],
        pagination: {
          page: 1,
          pageSize,
          totalItems: 0,
          totalPages: 1,
        },
      };
    }

    const filtered = allNews.filter((item) => {
      return (
        item.title.toLowerCase().includes(keyword) ||
        item.summary.toLowerCase().includes(keyword) ||
        item.tags.some((tag) => tag.toLowerCase().includes(keyword))
      );
    });

    const paginated = paginate(filtered, page, pageSize);

    return {
      query: rawKeyword,
      items: paginated.items,
      pagination: paginated.pagination,
    };
  },
};

export default newsService;
