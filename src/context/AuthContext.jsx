import { createContext, useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

const TOKENS_KEY = 'authTokens';
const USER_KEY = 'authUser';

const normalizeTokens = (data = {}) => {
  const accessToken = data.accessToken || data.access_token || data.token || data.jwt;
  const refreshToken = data.refreshToken || data.refresh_token || data.refresh;

  if (!accessToken && !refreshToken) return null;

  return { accessToken, refreshToken };
};

const unwrapAuthPayload = (responseData = {}) => responseData.data || responseData;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  const saveTokens = (tokens) => {
    try {
      localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    } catch {
      // ignore
    }
  };

  const getTokens = () => {
    try {
      const raw = localStorage.getItem(TOKENS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const clearStorage = () => {
    try {
      localStorage.removeItem(TOKENS_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  };

  const setAxiosAuthHeader = (accessToken) => {
    if (accessToken) axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    else delete axios.defaults.headers.common['Authorization'];
  };

  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    try {
      const tokens = getTokens();
      if (!tokens || (!tokens.accessToken && !tokens.refreshToken)) {
        return null;
      }

      if (tokens.accessToken) {
        setAxiosAuthHeader(tokens.accessToken);
      }

      try {
        const res = await authService.getProfile();
        const profile = unwrapAuthPayload(res.data);
        setUser(profile);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
        return profile;
      } catch (profileError) {
        // If the profile call fails and we have a refresh token, try once more after refresh.
        if (tokens && tokens.refreshToken) {
          const r = await axios.post('/auth/refresh-token', { refreshToken: tokens.refreshToken });
          const newTokens = normalizeTokens(unwrapAuthPayload(r.data));
          if (newTokens && newTokens.accessToken) {
            saveTokens(newTokens);
            setAxiosAuthHeader(newTokens.accessToken);
            const res = await authService.getProfile();
            const profile = unwrapAuthPayload(res.data);
            setUser(profile);
            localStorage.setItem(USER_KEY, JSON.stringify(profile));
            return profile;
          }
        }

        throw profileError;
      }
    } catch (err) {
      clearStorage();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      const data = unwrapAuthPayload(res.data);
      const tokens = normalizeTokens(data);
      if (tokens) {
        saveTokens(tokens);
        if (tokens.accessToken) {
          setAxiosAuthHeader(tokens.accessToken);
        }
      }

      // if user returned, set it; otherwise fetch profile
      if (data.user) {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      } else {
        try {
          await fetchCurrentUser();
        } catch {
          setUser({
            email: credentials.email,
            name: credentials.name || credentials.email,
          });
        }
      }

      return res;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const res = await authService.register(payload);
      const data = unwrapAuthPayload(res.data);
      // if backend returns tokens on register, persist and set user
      const tokens = normalizeTokens(data);
      if (tokens) {
        saveTokens(tokens);
        if (tokens.accessToken) {
          setAxiosAuthHeader(tokens.accessToken);
        }
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      } else {
        try {
          await fetchCurrentUser();
        } catch {
          setUser({
            email: payload.email,
            name: payload.name || payload.email,
          });
        }
      }

      return res;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const tokens = getTokens();
      if (tokens && tokens.refreshToken) {
        try {
          await axios.post('/auth/logout', { refreshToken: tokens.refreshToken });
        } catch {
          // ignore logout errors
        }
      }
    } finally {
      clearStorage();
      setAxiosAuthHeader(null);
      setUser(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const tokens = getTokens();
    if (!tokens || (!tokens.accessToken && !tokens.refreshToken)) {
      setLoading(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      void fetchCurrentUser();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchCurrentUser]);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
