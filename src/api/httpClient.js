import axios from 'axios';
import apiConfig from '@/config/apiConfig';
import {
  canRefreshAccessToken,
  clearAuthSession,
  getAuthorizationHeader,
  notifyUnauthorized,
  shouldRefreshAccessToken,
} from '@/services/authSession';
import { requestAccessTokenRefresh } from '@/services/authTokenRefresh';
import { logTechnicalError, normalizeAppError } from '@/utils/errorHandler';

const SKIP_AUTH_PATTERNS = Object.freeze([/\/auth\/login$/i, /\/auth\/refresh$/i]);
const AUTH_REFRESH_RETRY_KEY = '_authRefreshRetry';
const UNSAFE_METHODS = Object.freeze(['post', 'put', 'patch', 'delete']);

let refreshSessionPromise = null;

const shouldSkipAuthHeader = (config) => {
  if (config?.skipAuth) {
    return true;
  }

  const requestUrl = String(config?.url || '');
  return SKIP_AUTH_PATTERNS.some((pattern) => pattern.test(requestUrl));
};

const shouldSkipAuthRefresh = (config) => {
  return Boolean(config?.skipAuthRefresh || shouldSkipAuthHeader(config));
};

const setRequestHeader = (config, name, value) => {
  if (!value) {
    return;
  }

  if (typeof config.headers?.set === 'function') {
    config.headers.set(name, value);
    return;
  }

  config.headers = config.headers || {};
  config.headers[name] = value;
};

const attachAuthorizationHeader = (config) => {
  if (shouldSkipAuthHeader(config)) {
    return;
  }

  const authHeader = getAuthorizationHeader();

  if (authHeader) {
    setRequestHeader(config, 'Authorization', authHeader);
  }
};

const getCookieValue = (name) => {
  if (typeof document === 'undefined' || !name) {
    return '';
  }

  const encodedName = encodeURIComponent(name);
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${encodedName}=`));

  if (!cookie) {
    return '';
  }

  return decodeURIComponent(cookie.slice(encodedName.length + 1));
};

const getMetaValue = (name) => {
  if (typeof document === 'undefined' || !name) {
    return '';
  }

  return document
    .querySelector(`meta[name="${name}"]`)
    ?.getAttribute('content')
    ?.trim() || '';
};

const getCsrfToken = () => {
  return (
    getMetaValue(apiConfig.csrf.metaName) ||
    getCookieValue(apiConfig.csrf.cookieName)
  );
};

const attachCsrfHeader = (config) => {
  if (!apiConfig.csrf.enabled) {
    return;
  }

  const method = String(config?.method || 'get').toLowerCase();

  if (!UNSAFE_METHODS.includes(method)) {
    return;
  }

  const csrfToken = getCsrfToken();

  if (csrfToken) {
    setRequestHeader(config, apiConfig.csrf.headerName, csrfToken);
  }
};

const refreshAccessTokenOnce = async () => {
  if (!refreshSessionPromise) {
    refreshSessionPromise = requestAccessTokenRefresh()
      .finally(() => {
        refreshSessionPromise = null;
      });
  }

  return refreshSessionPromise;
};

const shouldRefreshBeforeRequest = (config) => {
  return !shouldSkipAuthRefresh(config) && shouldRefreshAccessToken();
};

const shouldRetryAfterUnauthorized = (error) => {
  const status = Number(error?.response?.status || 0);
  const originalRequest = error?.config || {};

  return (
    status === 401 &&
    !originalRequest[AUTH_REFRESH_RETRY_KEY] &&
    !shouldSkipAuthRefresh(originalRequest) &&
    canRefreshAccessToken()
  );
};

const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: apiConfig.withCredentials,
  ...(apiConfig.csrf.enabled
    ? {
        xsrfCookieName: apiConfig.csrf.cookieName,
        xsrfHeaderName: apiConfig.csrf.headerName,
      }
    : {}),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const nextConfig = config;

    if (shouldRefreshBeforeRequest(nextConfig)) {
      await refreshAccessTokenOnce();
    }

    attachAuthorizationHeader(nextConfig);
    attachCsrfHeader(nextConfig);

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
  async (error) => {
    const status = Number(error?.response?.status || 0);

    if (shouldRetryAfterUnauthorized(error)) {
      try {
        const originalRequest = error.config;
        originalRequest[AUTH_REFRESH_RETRY_KEY] = true;

        await refreshAccessTokenOnce();
        attachAuthorizationHeader(originalRequest);
        attachCsrfHeader(originalRequest);

        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAuthSession();
        notifyUnauthorized({
          status,
          reason: 'REFRESH_FAILED',
        });

        return Promise.reject(refreshError);
      }
    }

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
