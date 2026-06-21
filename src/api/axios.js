import axios from 'axios';
import { TOKENS_KEY, getStoredTokens, saveStoredTokens, clearStoredTokens, normalizeTokens, unwrapPayload } from './tokenUtils';

const API_URL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : '/';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// attach access token from storage if present
axiosInstance.interceptors.request.use((config) => {
  const url = config.url || '';
  const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/logout']
    .some((p) => url.endsWith(p) || url.includes(p));

  // allow auth endpoints to proceed without attaching access token
  if (isAuthEndpoint) return config;

  const tokens = getStoredTokens();
  if (tokens && tokens.accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
}, (error) => Promise.reject(error));

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject, originalConfig }) => {
    if (error) {
      reject(error);
    } else {
      if (token) originalConfig.headers = originalConfig.headers || {}, (originalConfig.headers.Authorization = `Bearer ${token}`);
      resolve(axiosInstance(originalConfig));
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response ? error.response.status : null;
    const url = originalRequest.url || '';
    // Do not skip /auth/me here so that 401 on profile triggers refresh flow
    const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/logout']
      .some((p) => url.endsWith(p) || url.includes(p));

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      return new Promise((resolve, reject) => {
        const tokens = getStoredTokens();
        const refreshToken = tokens ? tokens.refreshToken : null;

        // If there is no refresh token, bail out
        if (!refreshToken) {
          clearStoredTokens();
          reject(error);
          return;
        }

        failedQueue.push({ resolve, reject, originalConfig: originalRequest });

        if (isRefreshing) return;

        isRefreshing = true;

        const refreshClient = axios.create({ baseURL: API_URL, withCredentials: true });

        // attempt refresh; prefer cookie-only call, include body if refresh token stored
        const body = refreshToken ? { refreshToken } : undefined;
        refreshClient.post('/auth/refresh-token', body)
          .then((res) => {
            const payload = unwrapPayload(res.data);
            const newTokens = normalizeTokens(payload);
            if (newTokens && newTokens.accessToken) {
              saveStoredTokens(newTokens);
              axiosInstance.defaults.headers.common.Authorization = `Bearer ${newTokens.accessToken}`;
              processQueue(null, newTokens.accessToken);
            } else {
              clearStoredTokens();
              processQueue(new Error('Failed to refresh token'), null);
            }
          })
          .catch((err) => {
            console.error('refresh-token failed', err);
            clearStoredTokens();
            processQueue(err, null);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
