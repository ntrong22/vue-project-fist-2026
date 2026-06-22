import authConfig from '@/config/authConfig';
import apiClient from '@/api/httpClient';
import {
  clearAuthSession,
  setAuthSession,
} from '@/services/authSession';
import { normalizeAuthPayload } from '@/services/authPayload';
import { requestAccessTokenRefresh } from '@/services/authTokenRefresh';
import { normalizeAppError } from '@/utils/errorHandler';

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
    return requestAccessTokenRefresh();
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
