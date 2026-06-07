import axios from 'axios';

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

const TOKENS_KEY = 'authTokens';

const getStoredTokens = () => {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const saveStoredTokens = (tokens) => {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  } catch (e) {
    // ignore
  }
};

const clearStoredTokens = () => {
  try {
    localStorage.removeItem(TOKENS_KEY);
  } catch (e) {
    // ignore
  }
};

// attach access token from storage if present
axiosInstance.interceptors.request.use((config) => {
  // Do not attach Authorization header for auth endpoints (login/register/refresh)
  const url = config.url || '';
  const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/logout']
    .some((p) => url.endsWith(p) || url.includes(p));

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
      if (token) originalConfig.headers.Authorization = `Bearer ${token}`;
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
    const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/logout', '/auth/me']
      .some((p) => url.endsWith(p) || url.includes(p));

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      return new Promise((resolve, reject) => {
        const tokens = getStoredTokens();
        const refreshToken = tokens ? tokens.refreshToken : null;

        if (!refreshToken) {
          reject(error);
          return;
        }

        failedQueue.push({ resolve, reject, originalConfig: originalRequest });

        if (isRefreshing) return;

        isRefreshing = true;

        const refreshClient = axios.create({ baseURL: API_URL, withCredentials: true });

        // attempt refresh
        refreshClient.post('/auth/refresh-token', { refreshToken })
          .then((res) => {
            const newTokens = res.data;
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
