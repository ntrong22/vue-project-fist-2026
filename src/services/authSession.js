import authConfig from '@/config/authConfig';

let accessToken = '';
let refreshToken = '';
let expiresAt = 0;

const unauthorizedListeners = new Set();

const normalizeToken = (value) => {
  return typeof value === 'string' ? value.trim() : '';
};

export const setAuthSession = ({
  accessToken: nextAccessToken = '',
  refreshToken: nextRefreshToken = '',
  expiresAt: nextExpiresAt = 0,
} = {}) => {
  accessToken = normalizeToken(nextAccessToken);
  refreshToken = normalizeToken(nextRefreshToken);
  expiresAt = Number(nextExpiresAt) || 0;
};

export const clearAuthSession = () => {
  accessToken = '';
  refreshToken = '';
  expiresAt = 0;
};

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshToken;

export const hasValidAccessToken = () => {
  if (!accessToken) {
    return false;
  }

  if (!expiresAt) {
    return true;
  }

  return Date.now() < expiresAt;
};

export const getAuthorizationHeader = () => {
  if (!hasValidAccessToken()) {
    return '';
  }

  return `${authConfig.tokenType} ${accessToken}`;
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
