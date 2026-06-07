const readEnv = (key, fallback = '') => {
  return import.meta.env?.[key] ?? (
    typeof process !== 'undefined' && process.env ? process.env[key] : undefined
  ) ?? fallback;
};

const apiConfig = {
  baseURL: readEnv('VITE_API_BASE_URL', 'http://localhost:5000/api'),
  timeout: Number(readEnv('VITE_API_TIMEOUT', 12000)),
  withCredentials:
    String(readEnv('VITE_API_WITH_CREDENTIALS', 'false')).toLowerCase() === 'true',
};

export default apiConfig;
