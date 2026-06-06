import { normalizeSlug } from '@/utils/slugHelper';

const CONTROL_CHAR_PATTERN = /[\u0000-\u001F\u007F]/g;

const sanitizeText = (value = '', maxLength = 220) => {
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

export const normalizeCategoryItem = (item, fallbackId = 0) => {
  if (!item || typeof item !== 'object') {
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
  const description = sanitizeText(item.description || item.summary || '', 240);

  return {
    id,
    name,
    slug,
    description,
  };
};

export const normalizeCategoryList = (items = []) => {
  if (!Array.isArray(items)) {
    return [];
  }

  const seenSlugs = new Set();
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
