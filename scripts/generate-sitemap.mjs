import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const modeArgIndex = process.argv.findIndex((item) => item === '--mode');
const mode = modeArgIndex >= 0 && process.argv[modeArgIndex + 1]
  ? process.argv[modeArgIndex + 1]
  : 'production';

const readEnvFile = (filePath) => {
  const values = {};

  if (!fs.existsSync(filePath)) {
    return values;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const delimiterIndex = line.indexOf('=');

    if (delimiterIndex < 1) {
      continue;
    }

    const currentKey = line.slice(0, delimiterIndex).trim();
    const currentValue = line.slice(delimiterIndex + 1).trim();

    values[currentKey] = currentValue.replace(/^['"]|['"]$/g, '');
  }

  return values;
};

const loadEnvValues = (currentMode) => {
  const envFiles = [
    '.env',
    '.env.local',
    `.env.${currentMode}`,
    `.env.${currentMode}.local`,
  ];

  return envFiles.reduce((values, fileName) => ({
    ...values,
    ...readEnvFile(path.join(projectRoot, fileName)),
  }), {});
};

const normalizeBaseUrl = (value) => {
  const fallback = 'https://example.com';

  try {
    const normalized = new URL(value || fallback);
    normalized.pathname = '/';
    normalized.search = '';
    normalized.hash = '';
    return normalized.toString().replace(/\/$/, '');
  } catch {
    return fallback;
  }
};

const escapeXml = (value = '') => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const toIsoDate = (value, fallbackIsoDate) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallbackIsoDate;
  }

  return date.toISOString();
};

const createSitemapEntry = ({
  loc,
  lastmod,
  changefreq,
  priority,
}) => {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
    `    <changefreq>${escapeXml(changefreq)}</changefreq>`,
    `    <priority>${escapeXml(priority)}</priority>`,
    '  </url>',
  ].join('\n');
};

const createNewsSitemapEntry = ({
  loc,
  title,
  publicationDate,
  publicationName = 'VietNews 24h',
  language = 'vi',
}) => {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    '    <news:news>',
    '      <news:publication>',
    `        <news:name>${escapeXml(publicationName)}</news:name>`,
    `        <news:language>${escapeXml(language)}</news:language>`,
    '      </news:publication>',
    `      <news:publication_date>${escapeXml(publicationDate)}</news:publication_date>`,
    `      <news:title>${escapeXml(title)}</news:title>`,
    '    </news:news>',
    '  </url>',
  ].join('\n');
};

const buildSiteUrl = (baseUrl, pathname, query = {}) => {
  const url = new URL(pathname, `${baseUrl}/`);
  url.hash = '';
  url.search = '';

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    url.searchParams.set(String(key), String(value));
  });

  return url.toString();
};

const SUPPORTED_LOCALES = Object.freeze(['vi', 'en']);
const DEFAULT_LOCALE = 'vi';
const NOINDEX_PATH_PATTERNS = Object.freeze([
  /^\/tim-kiem(?:\/|$)/i,
  /^\/admin(?:\/|$)/i,
  /^\/login(?:\/|$)/i,
  /^\/test(?:\/|$)/i,
  /^\/draft(?:\/|$)/i,
]);
const ROBOTS_DISALLOW_PATHS = Object.freeze([
  '/admin',
  '/login',
  '/test',
  '/draft',
]);

const envValues = loadEnvValues(mode);
const appUrl = normalizeBaseUrl(process.env.VITE_APP_URL || envValues.VITE_APP_URL);
const appName = process.env.VITE_APP_NAME || envValues.VITE_APP_NAME || 'VietNews 24h';
const nowIsoDate = new Date().toISOString();

// Tải dữ liệu từ source để sitemap luôn bám theo danh mục và bài viết hiện có.
const categoriesModule = await import(
  pathToFileURL(path.join(projectRoot, 'src/data/categories.js')).href
);
const newsModule = await import(
  pathToFileURL(path.join(projectRoot, 'src/data/news.js')).href
);

const categories = categoriesModule.default || categoriesModule.categories || [];
const news = newsModule.default || newsModule.news || [];

const staticRoutes = [
  { path: '/', changefreq: 'hourly', priority: '1.0' },
  { path: '/tin-tuc', changefreq: 'hourly', priority: '0.9' },
  { path: '/gioi-thieu', changefreq: 'monthly', priority: '0.4' },
  { path: '/lien-he', changefreq: 'monthly', priority: '0.4' },
];

const routeMap = new Map();

const addRoute = ({
  path: pathname,
  query = {},
  lastmod = nowIsoDate,
  changefreq = 'daily',
  priority = '0.6',
}) => {
  if (!pathname) {
    return;
  }

  if (NOINDEX_PATH_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return;
  }

  const loc = buildSiteUrl(appUrl, pathname, query);

  if (routeMap.has(loc)) {
    return;
  }

  routeMap.set(loc, {
    loc,
    lastmod,
    changefreq,
    priority,
  });
};

staticRoutes.forEach((route) => {
  SUPPORTED_LOCALES.forEach((locale) => {
    addRoute({
      path: route.path,
      query: locale === DEFAULT_LOCALE ? {} : { lang: locale },
      changefreq: route.changefreq,
      priority: route.priority,
    });
  });
});

categories.forEach((item) => {
  if (!item?.slug) {
    return;
  }

  SUPPORTED_LOCALES.forEach((locale) => {
    addRoute({
      path: `/danh-muc/${item.slug}`,
      query: locale === DEFAULT_LOCALE ? {} : { lang: locale },
      changefreq: 'daily',
      priority: '0.7',
    });
  });
});

news.forEach((item) => {
  if (!item?.slug) {
    return;
  }

  SUPPORTED_LOCALES.forEach((locale) => {
    addRoute({
      path: `/tin-tuc/${item.slug}`,
      query: locale === DEFAULT_LOCALE ? {} : { lang: locale },
      lastmod: toIsoDate(item.updatedAt || item.publishedAt, nowIsoDate),
      changefreq: 'daily',
      priority: '0.8',
    });
  });
});

const sitemapContent = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...Array.from(routeMap.values()).map((entry) => createSitemapEntry(entry)),
  '</urlset>',
  '',
].join('\n');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent, 'utf8');

const newsSitemapItems = [...news]
  .filter((item) => item?.slug && item?.title && (item?.publishedAt || item?.updatedAt))
  .sort((a, b) => new Date(b.publishedAt || b.updatedAt).getTime() - new Date(a.publishedAt || a.updatedAt).getTime())
  .slice(0, 1000);

const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
const newsSitemapContent = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">',
  ...newsSitemapItems
    .filter((item) => {
      const publishedTime = new Date(item.publishedAt || item.updatedAt).getTime();
      return Number.isFinite(publishedTime) && publishedTime >= twoDaysAgo;
    })
    .map((item) =>
      createNewsSitemapEntry({
        loc: buildSiteUrl(appUrl, `/tin-tuc/${item.slug}`),
        title: item.title,
        publicationDate: toIsoDate(item.publishedAt || item.updatedAt, nowIsoDate),
        publicationName: appName,
        language: 'vi',
      }),
    ),
  '</urlset>',
  '',
].join('\n');

fs.writeFileSync(path.join(publicDir, 'news-sitemap.xml'), newsSitemapContent, 'utf8');

const robotsContent = [
  'User-agent: *',
  'Allow: /',
  ...ROBOTS_DISALLOW_PATHS.map((pathname) => `Disallow: ${pathname}`),
  '',
  `Sitemap: ${appUrl}/sitemap.xml`,
  `Sitemap: ${appUrl}/news-sitemap.xml`,
  '',
].join('\n');

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent, 'utf8');

console.log(`[sitemap] Generated ${routeMap.size} URLs and news sitemap for ${appUrl} (${mode})`);
