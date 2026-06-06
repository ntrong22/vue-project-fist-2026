import { defineStore } from 'pinia';
import categoryService from '@/services/categoryService';
import { getSafeErrorMessage } from '@/utils/errorHandler';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    currentCategory: null,
    loading: false,
    error: '',
    cacheKeys: {
      categoriesLoaded: false,
      categorySlug: '',
    },
  }),
  getters: {
    hasCategories: (state) => state.categories.length > 0,
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
      this.error = '';

      try {
        this.categories = await categoryService.getCategories();
        this.cacheKeys.categoriesLoaded = true;
      } catch (error) {
        this.error = getSafeErrorMessage(error, 'errors.fallback.categoryLoad');
        this.categories = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchCategoryBySlug(slug, forceReload = false) {
      if (this.loading) {
        return this.currentCategory;
      }

      const safeSlug = String(slug || '').trim().toLowerCase();

      if (!forceReload && this.cacheKeys.categorySlug === safeSlug && this.currentCategory) {
        return this.currentCategory;
      }

      this.loading = true;
      this.error = '';

      try {
        this.currentCategory = await categoryService.getCategoryBySlug(slug);
        this.cacheKeys.categorySlug = safeSlug;
      } catch (error) {
        this.error = getSafeErrorMessage(error, 'errors.fallback.categoryNotFound');
        this.currentCategory = null;
      } finally {
        this.loading = false;
      }

      return this.currentCategory;
    },
  },
});

export default useCategoryStore;
