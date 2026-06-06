import appConfig from '@/config/appConfig';
import { generateSlug, normalizeSlug } from '@/utils/slugHelper';

const CONTROL_CHAR_PATTERN = /[\u0000-\u001F\u007F]/g;

const sanitizeText = (value = '', maxLength = 320) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(CONTROL_CHAR_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
};

const toSafeInteger = (value, fallback = 0) => {
  const normalized = Number(value);

  if (Number.isNaN(normalized) || normalized < 0) {
    return fallback;
  }

  return Math.floor(normalized);
};

const toSafeBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  return fallback;
};

const toSafeIsoDate = (value, fallback = '') => {
  const rawValue = typeof value === 'string' || value instanceof Date ? value : '';
  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toISOString();
};

const toSafeImage = (value = '') => {
  const normalized = sanitizeText(value, 500);

  if (!normalized) {
    return appConfig.fallbackImage;
  }

  try {
    const resolved = new URL(normalized, appConfig.appUrl);
    if (!['http:', 'https:'].includes(resolved.protocol)) {
      return appConfig.fallbackImage;
    }

    return resolved.toString();
  } catch {
    return appConfig.fallbackImage;
  }
};

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  const unique = new Set();
  const result = [];

  tags.forEach((tag) => {
    const safeTag = sanitizeText(tag, 40);

    if (!safeTag) {
      return;
    }

    const normalizedKey = safeTag.toLowerCase();
    if (unique.has(normalizedKey)) {
      return;
    }

    unique.add(normalizedKey);
    result.push(safeTag);
  });

  return result.slice(0, 20);
};

const buildCategoryLookup = (categories = []) => {
  const mapById = new Map();
  const mapBySlug = new Map();

  categories.forEach((item) => {
    const safeId = toSafeInteger(item?.id, 0);
    const safeSlug = normalizeSlug(item?.slug || item?.name);

    if (safeId > 0) {
      mapById.set(safeId, item);
    }

    if (safeSlug) {
      mapBySlug.set(safeSlug, item);
    }
  });

  return {
    mapById,
    mapBySlug,
  };
};

const resolveCategory = (item, lookup) => {
  const safeCategoryId = toSafeInteger(item?.categoryId, 0);
  const safeCategorySlug = normalizeSlug(item?.categorySlug || item?.categoryName || '');

  const byId = safeCategoryId > 0 ? lookup.mapById.get(safeCategoryId) : null;
  const bySlug = safeCategorySlug ? lookup.mapBySlug.get(safeCategorySlug) : null;
  const matched = byId || bySlug || null;

  if (matched) {
    return {
      categoryId: toSafeInteger(matched.id, safeCategoryId),
      categoryName: sanitizeText(matched.name, 80),
      categorySlug: normalizeSlug(matched.slug || matched.name),
    };
  }

  const categoryName = sanitizeText(item?.categoryName || 'Tin tức', 80) || 'Tin tức';
  const categorySlug = normalizeSlug(item?.categorySlug || categoryName);

  return {
    categoryId: safeCategoryId,
    categoryName,
    categorySlug,
  };
};

export const normalizeNewsItem = (item, options = {}) => {
  const {
    categories = [],
    fallbackId = 0,
    categoryLookup = null,
  } = options;

  if (!item || typeof item !== 'object') {
    return null;
  }

  const lookup = categoryLookup || buildCategoryLookup(categories);

  const id = toSafeInteger(item.id, fallbackId || 0) || fallbackId || 0;
  const title = sanitizeText(item.title, 180);

  if (!title) {
    return null;
  }

  const slug = normalizeSlug(item.slug || generateSlug(title)) || `tin-${id || fallbackId || Date.now()}`;
  const summary = sanitizeText(item.summary || item.description || '', 320);
  const rawContent = typeof item.content === 'string' ? item.content.trim() : '';
  const content = rawContent || (summary ? `<p>${summary}</p>` : '');
  const publishedAt = toSafeIsoDate(item.publishedAt, '');
  const updatedAt = toSafeIsoDate(item.updatedAt, publishedAt);
  const viewCount = toSafeInteger(item.viewCount, 0);
  const author = sanitizeText(item.author || 'Ban biên tập', 80) || 'Ban biên tập';
  const tags = normalizeTags(item.tags);
  const categoryInfo = resolveCategory(item, lookup);

  const seoTitle = sanitizeText(item.seoTitle || `${title} | VietNews 24h`, 180);
  const seoDescription = sanitizeText(item.seoDescription || summary, 320);
  const seoKeywords = sanitizeText(item.seoKeywords || tags.join(', '), 320);

  return {
    id,
    title,
    slug,
    summary,
    content,
    thumbnail: toSafeImage(item.thumbnail),
    categoryId: categoryInfo.categoryId,
    categoryName: categoryInfo.categoryName,
    categorySlug: categoryInfo.categorySlug,
    author,
    publishedAt,
    updatedAt,
    viewCount,
    isFeatured: toSafeBoolean(item.isFeatured, false),
    isHot: toSafeBoolean(item.isHot, false),
    tags,
    seoTitle,
    seoDescription,
    seoKeywords,
  };
};

export const normalizeNewsList = (items = [], categories = []) => {
  if (!Array.isArray(items)) {
    return [];
  }

  const normalized = [];
  const seenSlug = new Set();
  const lookup = buildCategoryLookup(categories);

  items.forEach((item, index) => {
    const mapped = normalizeNewsItem(item, {
      categories,
      fallbackId: index + 1,
      categoryLookup: lookup,
    });

    if (!mapped || seenSlug.has(mapped.slug)) {
      return;
    }

    seenSlug.add(mapped.slug);
    normalized.push(mapped);
  });

  return normalized;
};
