const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 12000),
  withCredentials:
    String(import.meta.env.VITE_API_WITH_CREDENTIALS || 'false').toLowerCase() === 'true',
};

export default apiConfig;
