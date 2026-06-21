export const TOKENS_KEY = 'authTokens';

export const normalizeTokens = (data = {}) => {
  const accessToken = data.accessToken || data.access_token || data.token || data.jwt;
  const refreshToken = data.refreshToken || data.refresh_token || data.refresh;

  if (!accessToken && !refreshToken) return null;
  return { accessToken, refreshToken };
};

export const unwrapPayload = (maybeWrapped = {}) => {
  // Backend often responds with { success, message, data: { ... } }
  if (maybeWrapped && typeof maybeWrapped === 'object' && Object.prototype.hasOwnProperty.call(maybeWrapped, 'data')) {
    return maybeWrapped.data;
  }
  return maybeWrapped;
};

export const getStoredTokens = () => {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('getStoredTokens parse error', e);
    return null;
  }
};

export const saveStoredTokens = (tokens) => {
  try {
    if (!tokens) return;
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  } catch (e) {
    console.error('saveStoredTokens error', e);
  }
};

export const clearStoredTokens = () => {
  try {
    localStorage.removeItem(TOKENS_KEY);
  } catch (e) {
    console.error('clearStoredTokens error', e);
  }
};
