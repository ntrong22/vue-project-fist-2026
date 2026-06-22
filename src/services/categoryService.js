import appConfig from '@/config/appConfig';
import categoriesMock from '@/data/categories';
import apiClient from '@/api/httpClient';
import {
  normalizeCategoryItem,
  normalizeCategoryList,
} from '@/services/categoryMapper';
import { logTechnicalError } from '@/utils/errorHandler';
import { normalizeSlug } from '@/utils/slugHelper';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const extractCategoriesResponse = (payload) => {
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

const normalizedMockCategories = normalizeCategoryList(categoriesMock);

const getCategoriesFallback = () => {
  return appConfig.allowMockFallback ? normalizedMockCategories : [];
};

const getCategoryFallbackBySlug = (slug) => {
  if (!appConfig.allowMockFallback) {
    return null;
  }

  return normalizedMockCategories.find((item) => item.slug === slug) || null;
};

export const categoryService = {
  async getCategories() {
    if (appConfig.useMockApi) {
      await delay();
      return normalizedMockCategories;
    }

    try {
      const response = await apiClient.get('/categories');
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
      logTechnicalError(error, 'categoryService:getCategories');
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
      logTechnicalError(error, 'categoryService:getCategoryBySlug');
      return getCategoryFallbackBySlug(safeSlug);
    }
  },
};

export default categoryService;
