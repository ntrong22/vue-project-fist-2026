const appConfig = {
  appName: import.meta.env.VITE_APP_NAME || 'VietNews 24h',
  appUrl: import.meta.env.VITE_APP_URL || 'https://example.com',
  useMockApi: String(import.meta.env.VITE_USE_MOCK_API || 'true').toLowerCase() !== 'false',
  defaultPageSize: 6,
  relatedNewsLimit: 4,
  newsCacheTtlMs: Number(import.meta.env.VITE_NEWS_CACHE_TTL_MS || 60000),
  fallbackImage: '/images/fallback-news.svg',
};

export default appConfig;
