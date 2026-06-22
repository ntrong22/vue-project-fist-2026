const normalizeToken = (value) => {
  return typeof value === 'string' ? value.trim() : '';
};

const normalizeExpiresAt = (payload = {}) => {
  const directExpiresAt = payload.expiresAt || payload.expires_at || payload.exp;
  const directValue = Number(directExpiresAt || 0);

  if (directValue > 0) {
    return directValue < 1000000000000 ? directValue * 1000 : directValue;
  }

  const expiresIn = Number(payload.expiresIn || payload.expires_in || 0);
  return expiresIn > 0 ? Date.now() + expiresIn * 1000 : 0;
};

export const normalizeAuthPayload = (payload = {}) => {
  return {
    accessToken: normalizeToken(payload.accessToken || payload.access_token || payload.token || ''),
    refreshToken: normalizeToken(payload.refreshToken || payload.refresh_token || ''),
    expiresAt: normalizeExpiresAt(payload),
  };
};
