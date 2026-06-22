import axios from 'axios';
import apiConfig from '@/config/apiConfig';
import authConfig from '@/config/authConfig';
import {
  clearAuthSession,
  getRefreshToken,
  setAuthSession,
} from '@/services/authSession';
import { normalizeAuthPayload } from '@/services/authPayload';
import { normalizeAppError } from '@/utils/errorHandler';

const refreshClient = axios.create({
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

const buildRefreshPayload = (refreshToken) => {
  if (authConfig.refreshUsesCookie) {
    return {};
  }

  return { refreshToken };
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
  if (!apiConfig.csrf.enabled) {
    return '';
  }

  return (
    getMetaValue(apiConfig.csrf.metaName) ||
    getCookieValue(apiConfig.csrf.cookieName)
  );
};

const buildRefreshRequestConfig = () => {
  const csrfToken = getCsrfToken();

  if (!csrfToken) {
    return {};
  }

  return {
    headers: {
      [apiConfig.csrf.headerName]: csrfToken,
    },
  };
};

export const requestAccessTokenRefresh = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken && !authConfig.refreshUsesCookie) {
    clearAuthSession();
    return null;
  }

  try {
    const response = await refreshClient.post(
      authConfig.refreshEndpoint,
      buildRefreshPayload(refreshToken),
      buildRefreshRequestConfig(),
    );

    const payload = response.data?.data || response.data || {};
    const session = normalizeAuthPayload(payload);

    setAuthSession({
      ...session,
      refreshToken: session.refreshToken || refreshToken,
    });

    return {
      ...session,
      refreshToken: session.refreshToken || refreshToken,
    };
  } catch (error) {
    clearAuthSession();

    throw normalizeAppError(error, {
      context: 'auth:refresh',
      fallbackMessage: 'errors.fallback.refreshExpired',
    });
  }
};
