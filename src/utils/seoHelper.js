import appConfig from '@/config/appConfig';
import {
  DEFAULT_LOCALE,
  FALLBACK_HREFLANG,
  HREFLANG_MAP,
  SUPPORTED_LOCALES,
} from '@/constants/localeConstants';

const CONTROL_CHAR_PATTERN = /[\u0000-\u001F\u007F]/g;
const TAG_PATTERN = /<[^>]*>/g;
const SCHEMA_SCRIPT_PREFIX = 'seo-schema-';

const sanitizeMetaText = (value = '', maxLength = 320) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(CONTROL_CHAR_PATTERN, ' ')
    .replace(TAG_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
};

const sanitizeUrl = (value = '', fallbackPath = '') => {
  if (!value || typeof value !== 'string') {
    if (!fallbackPath) {
      return '';
    }

    return sanitizeUrl(fallbackPath);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  try {
    const normalized = new URL(trimmed, appConfig.appUrl);

    if (!['http:', 'https:'].includes(normalized.protocol)) {
      return '';
    }

    return normalized.toString();
  } catch {
    return '';
  }
};

const upsertMetaTag = ({ selector, attrKey, attrValue, content }) => {
  if (typeof document === 'undefined') {
    return;
  }

  const safeContent = sanitizeMetaText(content);
  const current = document.head.querySelector(selector);

  if (!safeContent) {
    if (current) {
      current.remove();
    }
    return;
  }

  let meta = current;

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attrKey, attrValue);
    document.head.appendChild(meta);
  }

  meta.setAttribute('content', safeContent);
};

const upsertMetaByName = (name, content) =>
  upsertMetaTag({
    selector: `meta[name="${name}"]`,
    attrKey: 'name',
    attrValue: name,
    content,
  });

const upsertMetaByProperty = (property, content) =>
  upsertMetaTag({
    selector: `meta[property="${property}"]`,
    attrKey: 'property',
    attrValue: property,
    content,
  });

const upsertCanonical = (href) => {
  if (typeof document === 'undefined') {
    return;
  }

  const current = document.head.querySelector('link[rel="canonical"]');
  const safeHref = sanitizeUrl(href);

  if (!safeHref) {
    if (current) {
      current.remove();
    }
    return;
  }

  let link = current;

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', safeHref);
};

const resetAlternateLinks = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const links = document.head.querySelectorAll('link[rel="alternate"][hreflang]');
  links.forEach((link) => link.remove());
};

const upsertAlternateLinks = (alternates = []) => {
  if (typeof document === 'undefined') {
    return;
  }

  resetAlternateLinks();

  alternates.forEach((item) => {
    const hreflang = sanitizeMetaText(item?.hreflang || '', 40);
    const href = sanitizeUrl(item?.href || '');

    if (!hreflang || !href) {
      return;
    }

    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', hreflang);
    link.setAttribute('href', href);
    link.setAttribute('data-seo-alt', 'true');
    document.head.appendChild(link);
  });
};

const resetOgLocaleAlternates = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const tags = document.head.querySelectorAll('meta[property="og:locale:alternate"]');
  tags.forEach((tag) => tag.remove());
};

const upsertOgLocaleAlternates = (locales = []) => {
  if (typeof document === 'undefined') {
    return;
  }

  resetOgLocaleAlternates();

  locales.forEach((localeValue) => {
    const safeLocale = sanitizeMetaText(String(localeValue || ''), 40);

    if (!safeLocale) {
      return;
    }

    const tag = document.createElement('meta');
    tag.setAttribute('property', 'og:locale:alternate');
    tag.setAttribute('content', safeLocale);
    tag.setAttribute('data-og-locale-alt', 'true');
    document.head.appendChild(tag);
  });
};

const normalizeQueryValue = (value) => {
  if (value === undefined || value === null) {
    return '';
  }

  return sanitizeMetaText(String(value), 100);
};

export const buildCanonicalUrl = (path = '', query = {}) => {
  const url = new URL(appConfig.appUrl);
  const safePath = String(path || '/').startsWith('/') ? String(path || '/') : `/${path}`;
  url.pathname = safePath;
  url.hash = '';

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

export const buildLocalizedCanonicalUrl = (path = '', locale = DEFAULT_LOCALE, query = {}) => {
  const safeLocale = String(locale || DEFAULT_LOCALE).toLowerCase();

  if (safeLocale === DEFAULT_LOCALE) {
    return buildCanonicalUrl(path, query);
  }

  return buildCanonicalUrl(path, {
    ...query,
    lang: safeLocale,
  });
};

export const buildAlternateLocaleLinks = (path = '', query = {}) => {
  const alternateLinks = SUPPORTED_LOCALES.map((locale) => ({
    hreflang: HREFLANG_MAP[locale],
    href: buildLocalizedCanonicalUrl(path, locale, query),
  }));

  alternateLinks.push({
    hreflang: FALLBACK_HREFLANG,
    href: buildLocalizedCanonicalUrl(path, DEFAULT_LOCALE, query),
  });

  return alternateLinks;
};

export const buildAbsoluteUrl = (value = '') => {
  return sanitizeUrl(value);
};

export const setStructuredData = (schemaId, schemaObject) => {
  if (typeof document === 'undefined') {
    return;
  }

  if (!schemaId || !schemaObject || typeof schemaObject !== 'object') {
    return;
  }

  const scriptId = `${SCHEMA_SCRIPT_PREFIX}${schemaId}`;
  let script = document.head.querySelector(`#${scriptId}`);

  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  // Ghi đè schema theo route hiện tại để tránh dữ liệu JSON-LD cũ bị giữ lại.
  script.textContent = JSON.stringify(schemaObject);
};

export const removeStructuredData = (schemaId) => {
  if (typeof document === 'undefined') {
    return;
  }

  const scriptId = `${SCHEMA_SCRIPT_PREFIX}${schemaId}`;
  const script = document.head.querySelector(`#${scriptId}`);

  if (script) {
    script.remove();
  }
};

export const updateSeoMeta = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  robots = 'index, follow',
  twitterCard = 'summary_large_image',
  locale = DEFAULT_LOCALE,
  alternates = [],
  canonical,
}) => {
  if (typeof document === 'undefined') {
    return;
  }

  const safeLocale = String(locale || DEFAULT_LOCALE).toLowerCase();
  document.documentElement.setAttribute('lang', safeLocale);

  const safeTitle = sanitizeMetaText(title, 80);
  const safeDescription = sanitizeMetaText(description, 320);
  const canonicalUrl = sanitizeUrl(canonical);
  const safeOgImage = sanitizeUrl(ogImage, '/images/og-default.svg');
  const safeOgLocale = sanitizeMetaText(
    String(HREFLANG_MAP[safeLocale] || HREFLANG_MAP[DEFAULT_LOCALE] || 'vi-VN').replace('-', '_'),
    40,
  );
  const ogLocaleAlternates = SUPPORTED_LOCALES
    .filter((item) => item !== safeLocale)
    .map((item) => String(HREFLANG_MAP[item] || '').replace('-', '_'))
    .filter(Boolean);

  if (safeTitle) {
    document.title = safeTitle;
  }

  upsertMetaByName('description', safeDescription);
  upsertMetaByName('keywords', keywords);
  upsertMetaByName('robots', robots);

  upsertMetaByProperty('og:type', sanitizeMetaText(ogType, 40) || 'website');
  upsertMetaByProperty('og:url', canonicalUrl);
  upsertMetaByProperty('og:title', ogTitle || safeTitle);
  upsertMetaByProperty('og:description', ogDescription || safeDescription);
  upsertMetaByProperty('og:image', safeOgImage);
  upsertMetaByProperty('og:image:alt', ogTitle || safeTitle);
  upsertMetaByProperty('og:site_name', appConfig.appName);
  upsertMetaByProperty('og:locale', safeOgLocale);
  upsertOgLocaleAlternates(ogLocaleAlternates);

  upsertMetaByName('twitter:card', twitterCard);
  upsertMetaByName('twitter:title', ogTitle || safeTitle);
  upsertMetaByName('twitter:description', ogDescription || safeDescription);
  upsertMetaByName('twitter:image', safeOgImage);

  upsertCanonical(canonicalUrl);
  upsertAlternateLinks(alternates);
};

export const setDefaultSeoMeta = (meta = {}) => {
  updateSeoMeta({
    title: `${appConfig.appName} - Tin tức mới nhất mỗi ngày`,
    description: 'Trang tin tổng hợp cập nhật liên tục, nội dung chọn lọc và dễ đọc trên mọi thiết bị.',
    keywords: 'tin tức, tin nóng, thời sự, công nghệ, kinh doanh',
    canonical: buildCanonicalUrl('/'),
    ...meta,
  });
};
