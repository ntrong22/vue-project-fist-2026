const readEnv = (key, fallback = '') => {
  return import.meta.env?.[key] ?? (
    typeof process !== 'undefined' && process.env ? process.env[key] : undefined
  ) ?? fallback;
};

const appConfig = {
  appName: readEnv('VITE_APP_NAME', 'VietNews 24h'),
  appUrl: readEnv('VITE_APP_URL', 'https://example.com'),
  useMockApi: String(readEnv('VITE_USE_MOCK_API', 'true')).toLowerCase() !== 'false',
  defaultPageSize: 6,
  relatedNewsLimit: 4,
  newsCacheTtlMs: Number(readEnv('VITE_NEWS_CACHE_TTL_MS', 60000)),
  fallbackImage: '/images/fallback-news.svg',
};

export default appConfig;
