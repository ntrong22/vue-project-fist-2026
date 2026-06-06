import axios from 'axios';
import apiConfig from '@/config/apiConfig';
import {
  clearAuthSession,
  getAuthorizationHeader,
  notifyUnauthorized,
} from '@/services/authSession';
import { logTechnicalError, normalizeAppError } from '@/utils/errorHandler';

const SKIP_AUTH_PATTERNS = Object.freeze([/\/auth\/login$/i, /\/auth\/refresh$/i]);

const shouldSkipAuthHeader = (config) => {
  if (config?.skipAuth) {
    return true;
  }

  const requestUrl = String(config?.url || '');
  return SKIP_AUTH_PATTERNS.some((pattern) => pattern.test(requestUrl));
};

const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: apiConfig.withCredentials,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const nextConfig = config;
    const authHeader = getAuthorizationHeader();

    if (!shouldSkipAuthHeader(nextConfig) && authHeader) {
      if (typeof nextConfig.headers?.set === 'function') {
        nextConfig.headers.set('Authorization', authHeader);
      } else {
        nextConfig.headers = nextConfig.headers || {};
        nextConfig.headers.Authorization = authHeader;
      }
    }

    return nextConfig;
  },
  (error) => {
    const normalizedError = normalizeAppError(error, {
      context: 'api:request',
      fallbackMessage: 'errors.fallback.requestInit',
    });

    return Promise.reject(normalizedError);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = Number(error?.response?.status || 0);

    if (status === 401) {
      clearAuthSession();
      notifyUnauthorized({
        status,
        reason: 'UNAUTHORIZED',
      });
    }

    const normalizedError = normalizeAppError(error, {
      context: 'api:response',
      fallbackMessage: 'errors.fallback.requestHandle',
    });

    if ([0, 401, 403, 500].includes(status)) {
      logTechnicalError(error, 'api:response');
    }

    return Promise.reject(normalizedError);
  },
);

export default apiClient;
