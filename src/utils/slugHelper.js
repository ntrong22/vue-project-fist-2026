export const generateSlug = (value = '') => {
  return value
    .toString()
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const normalizeSlug = (slug = '') => {
  return generateSlug(slug).replace(/^-|-$/g, '');
};

export const buildNewsPath = (slug = '') => {
  return `/tin-tuc/${normalizeSlug(slug)}`;
};

export const buildCategoryPath = (slug = '') => {
  return `/danh-muc/${normalizeSlug(slug)}`;
};
