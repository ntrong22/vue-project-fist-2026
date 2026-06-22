import authConfig from '@/config/authConfig';

let accessToken = '';
let refreshToken = '';
let expiresAt = 0;

const unauthorizedListeners = new Set();

const isBrowserRuntime = () => typeof window !== 'undefined';

const normalizeToken = (value) => {
  return typeof value === 'string' ? value.trim() : '';
};

export const setAuthSession = ({
  accessToken: nextAccessToken = '',
  refreshToken: nextRefreshToken = '',
  expiresAt: nextExpiresAt = 0,
} = {}) => {
  if (!isBrowserRuntime()) {
    return;
  }

  accessToken = normalizeToken(nextAccessToken);
  refreshToken = normalizeToken(nextRefreshToken);
  expiresAt = Number(nextExpiresAt) || 0;
};

export const clearAuthSession = () => {
  if (!isBrowserRuntime()) {
    return;
  }

  accessToken = '';
  refreshToken = '';
  expiresAt = 0;
};

export const getAccessToken = () => (isBrowserRuntime() ? accessToken : '');
export const getRefreshToken = () => (isBrowserRuntime() ? refreshToken : '');
export const getAccessTokenExpiresAt = () => (isBrowserRuntime() ? expiresAt : 0);

export const hasRefreshToken = () => Boolean(getRefreshToken());

export const canRefreshAccessToken = () => {
  return hasRefreshToken() || authConfig.refreshUsesCookie;
};

export const hasValidAccessToken = () => {
  const currentAccessToken = getAccessToken();

  if (!currentAccessToken) {
    return false;
  }

  const currentExpiresAt = getAccessTokenExpiresAt();

  if (!currentExpiresAt) {
    return true;
  }

  return Date.now() < currentExpiresAt;
};

export const shouldRefreshAccessToken = (
  thresholdMs = authConfig.refreshBeforeExpiresMs,
) => {
  if (!isBrowserRuntime() || !canRefreshAccessToken()) {
    return false;
  }

  const currentAccessToken = getAccessToken();
  const currentExpiresAt = getAccessTokenExpiresAt();

  if (!currentAccessToken || !currentExpiresAt) {
    return false;
  }

  return Date.now() + Math.max(Number(thresholdMs) || 0, 0) >= currentExpiresAt;
};

export const getAuthorizationHeader = () => {
  if (!hasValidAccessToken()) {
    return '';
  }

  return `${authConfig.tokenType} ${getAccessToken()}`;
};

export const addUnauthorizedListener = (listener) => {
  if (typeof listener !== 'function') {
    return () => {};
  }

  unauthorizedListeners.add(listener);

  return () => unauthorizedListeners.delete(listener);
};

export const notifyUnauthorized = (payload = {}) => {
  unauthorizedListeners.forEach((listener) => {
    listener(payload);
  });
};
