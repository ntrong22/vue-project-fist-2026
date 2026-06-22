const readEnv = (key, fallback = '') => {
  return import.meta.env?.[key] ?? (
    typeof process !== 'undefined' && process.env ? process.env[key] : undefined
  ) ?? fallback;
};

const readBooleanEnv = (key, fallback = 'false') => {
  return String(readEnv(key, fallback)).toLowerCase() === 'true';
};

const readNumberEnv = (key, fallback) => {
  const value = Number(readEnv(key, fallback));
  return Number.isFinite(value) ? value : Number(fallback);
};

const apiConfig = {
  baseURL: readEnv('VITE_API_BASE_URL', 'http://localhost:5000/api'),
  timeout: readNumberEnv('VITE_API_TIMEOUT', 12000),
  withCredentials: readBooleanEnv('VITE_API_WITH_CREDENTIALS'),
  csrf: {
    enabled: readBooleanEnv('VITE_API_CSRF_ENABLED'),
    cookieName: readEnv('VITE_API_CSRF_COOKIE_NAME', 'XSRF-TOKEN'),
    headerName: readEnv('VITE_API_CSRF_HEADER_NAME', 'X-CSRF-TOKEN'),
    metaName: readEnv('VITE_API_CSRF_META_NAME', 'csrf-token'),
  },
};

export default apiConfig;
