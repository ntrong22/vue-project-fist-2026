import i18n from '@/plugins/i18n';

const STATUS_MESSAGE_MAP = Object.freeze({
  400: 'errors.http.400',
  401: 'errors.http.401',
  403: 'errors.http.403',
  404: 'errors.http.404',
  408: 'errors.http.408',
  429: 'errors.http.429',
  500: 'errors.http.500',
  502: 'errors.http.502',
  503: 'errors.http.503',
  504: 'errors.http.504',
});

const CODE_MESSAGE_MAP = Object.freeze({
  ECONNABORTED: 'errors.code.ECONNABORTED',
  ERR_NETWORK: 'errors.code.ERR_NETWORK',
  ERR_CANCELED: 'errors.code.ERR_CANCELED',
});

const DEFAULT_UI_MESSAGE_KEY = 'errors.common.default';

const getStatusCode = (rawError) => {
  const status = Number(rawError?.status || rawError?.response?.status || 0);
  return Number.isNaN(status) ? 0 : status;
};

const getErrorCode = (rawError) => {
  return rawError?.code || rawError?.response?.data?.code || 'UNKNOWN_ERROR';
};

const getTechnicalMessage = (rawError) => {
  const serverError = rawError?.response?.data?.error;
  const serverMessage = rawError?.response?.data?.message;

  if (typeof rawError?.message === 'string' && rawError.message.trim()) {
    return rawError.message;
  }

  if (typeof serverError === 'string' && serverError.trim()) {
    return serverError;
  }

  if (typeof serverMessage === 'string' && serverMessage.trim()) {
    return serverMessage;
  }

  return 'Unknown technical error';
};

const translateKey = (value = '', fallbackText = '') => {
  const key = typeof value === 'string' ? value.trim() : '';

  if (!key) {
    return fallbackText;
  }

  try {
    if (i18n.global.te(key)) {
      return i18n.global.t(key);
    }
  } catch {
    // Không throw lỗi i18n để tránh làm vỡ luồng hiển thị thông báo.
  }

  return key || fallbackText;
};

const resolveFallbackMessage = (fallbackMessage) => {
  const defaultMessage = translateKey(DEFAULT_UI_MESSAGE_KEY, 'An unexpected error occurred.');
  return translateKey(fallbackMessage, defaultMessage);
};

export const normalizeAppError = (
  rawError,
  {
    fallbackMessage = DEFAULT_UI_MESSAGE_KEY,
    context = 'app',
  } = {},
) => {
  const status = getStatusCode(rawError);
  const code = getErrorCode(rawError);
  const fallback = resolveFallbackMessage(fallbackMessage);

  return {
    status,
    code,
    context,
    technicalMessage: getTechnicalMessage(rawError),
    message:
      translateKey(STATUS_MESSAGE_MAP[status]) ||
      translateKey(CODE_MESSAGE_MAP[code]) ||
      fallback,
    details: rawError?.response?.data || null,
  };
};

export const getSafeErrorMessage = (rawError, fallbackMessage = DEFAULT_UI_MESSAGE_KEY) => {
  return normalizeAppError(rawError, { fallbackMessage }).message;
};

export const logTechnicalError = (rawError, context = 'app') => {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, rawError);
  }
};
