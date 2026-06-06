import authConfig from '@/config/authConfig';
import apiClient from '@/api/httpClient';
import {
  clearAuthSession,
  getRefreshToken,
  setAuthSession,
} from '@/services/authSession';
import { normalizeAppError } from '@/utils/errorHandler';

const normalizeAuthPayload = (payload = {}) => {
  const accessToken = payload.accessToken || payload.token || '';
  const refreshToken = payload.refreshToken || '';
  const expiresIn = Number(payload.expiresIn || 0);

  const expiresAt = expiresIn > 0 ? Date.now() + expiresIn * 1000 : 0;

  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
};

export const authService = {
  async login(credentials = {}) {
    try {
      const response = await apiClient.post(authConfig.loginEndpoint, credentials, {
        skipAuth: true,
      });

      const payload = response.data?.data || response.data || {};
      const session = normalizeAuthPayload(payload);
      setAuthSession(session);

      return session;
    } catch (error) {
      throw normalizeAppError(error, {
        context: 'auth:login',
        fallbackMessage: 'errors.fallback.loginFailed',
      });
    }
  },

  async refreshAccessToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearAuthSession();
      return null;
    }

    try {
      const response = await apiClient.post(
        authConfig.refreshEndpoint,
        { refreshToken },
        {
          skipAuth: true,
        },
      );

      const payload = response.data?.data || response.data || {};
      const session = normalizeAuthPayload(payload);
      setAuthSession({
        ...session,
        refreshToken: session.refreshToken || refreshToken,
      });

      return session;
    } catch (error) {
      clearAuthSession();

      throw normalizeAppError(error, {
        context: 'auth:refresh',
        fallbackMessage: 'errors.fallback.refreshExpired',
      });
    }
  },

  async logout() {
    try {
      await apiClient.post(authConfig.logoutEndpoint, null, {
        skipAuth: false,
      });
    } catch {
      // Do nothing to avoid blocking client-side cleanup on network failures.
    } finally {
      clearAuthSession();
    }
  },
};

export default authService;
