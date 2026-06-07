const readEnv = (key, fallback = '') => {
  return import.meta.env?.[key] ?? (
    typeof process !== 'undefined' && process.env ? process.env[key] : undefined
  ) ?? fallback;
};

const authConfig = {
  tokenType: readEnv('VITE_AUTH_TOKEN_TYPE', 'Bearer'),
  loginEndpoint: readEnv('VITE_AUTH_LOGIN_ENDPOINT', '/auth/login'),
  refreshEndpoint: readEnv('VITE_AUTH_REFRESH_ENDPOINT', '/auth/refresh'),
  logoutEndpoint: readEnv('VITE_AUTH_LOGOUT_ENDPOINT', '/auth/logout'),
};

export default authConfig;
