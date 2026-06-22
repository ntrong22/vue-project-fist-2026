const readEnv = (key, fallback = '') => {
  return import.meta.env?.[key] ?? (
    typeof process !== 'undefined' && process.env ? process.env[key] : undefined
  ) ?? fallback;
};

const readBooleanEnv = (key, fallback = 'false') => {
  return String(readEnv(key, fallback)).toLowerCase() === 'true';
};

const readNumberEnv = (key, fallback) => {
  const value = Number(readEnv(key, fallback));
  return Number.isFinite(value) ? value : Number(fallback);
};

const authConfig = {
  tokenType: readEnv('VITE_AUTH_TOKEN_TYPE', 'Bearer'),
  loginEndpoint: readEnv('VITE_AUTH_LOGIN_ENDPOINT', '/auth/login'),
  refreshEndpoint: readEnv('VITE_AUTH_REFRESH_ENDPOINT', '/auth/refresh'),
  logoutEndpoint: readEnv('VITE_AUTH_LOGOUT_ENDPOINT', '/auth/logout'),
  loginPath: readEnv('VITE_AUTH_LOGIN_PATH', '/'),
  refreshBeforeExpiresMs: readNumberEnv('VITE_AUTH_REFRESH_BEFORE_EXPIRES_MS', 60000),
  refreshUsesCookie: readBooleanEnv('VITE_AUTH_REFRESH_USES_COOKIE'),
};

export default authConfig;
