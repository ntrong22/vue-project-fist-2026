const authConfig = {
  tokenType: import.meta.env.VITE_AUTH_TOKEN_TYPE || 'Bearer',
  loginEndpoint: import.meta.env.VITE_AUTH_LOGIN_ENDPOINT || '/auth/login',
  refreshEndpoint: import.meta.env.VITE_AUTH_REFRESH_ENDPOINT || '/auth/refresh',
  logoutEndpoint: import.meta.env.VITE_AUTH_LOGOUT_ENDPOINT || '/auth/logout',
};

export default authConfig;
