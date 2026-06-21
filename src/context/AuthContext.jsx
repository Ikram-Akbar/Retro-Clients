import { createContext, useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import * as authService from '../services/authService';
import { normalizeTokens, unwrapPayload, getStoredTokens, saveStoredTokens, clearStoredTokens } from '../api/tokenUtils';

export const AuthContext = createContext(null);

const USER_KEY = 'authUser';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('AuthProvider user parse error', e);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  const clearStorage = () => {
    try {
      clearStoredTokens();
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('clearStorage error', e);
    }
  };

  const setAxiosAuthHeader = (accessToken) => {
    if (accessToken) axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    else delete axios.defaults.headers.common['Authorization'];
  };

  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    try {
      const tokens = getStoredTokens();
      if (!tokens || (!tokens.accessToken && !tokens.refreshToken)) {
        setLoading(false);
        return null;
      }

      if (tokens.accessToken) setAxiosAuthHeader(tokens.accessToken);

      // Let axios interceptor attempt refresh and retry if needed
      const res = await authService.getProfile();
      const profile = unwrapPayload(res.data);
      setUser(profile);
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
      return profile;
    } catch (err) {
      console.error('fetchCurrentUser failed', err);
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
      const data = unwrapPayload(res.data);
      const tokens = normalizeTokens(data);
      if (tokens) {
        saveStoredTokens(tokens);
        if (tokens.accessToken) setAxiosAuthHeader(tokens.accessToken);
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      } else {
        await fetchCurrentUser();
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
      const data = unwrapPayload(res.data);
      const tokens = normalizeTokens(data);
      if (tokens) {
        saveStoredTokens(tokens);
        if (tokens.accessToken) setAxiosAuthHeader(tokens.accessToken);
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      } else {
        await fetchCurrentUser();
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
      const tokens = getStoredTokens();
      if (tokens && tokens.refreshToken) {
        try {
          await axios.post('/auth/logout', { refreshToken: tokens.refreshToken });
        } catch (err) {
          console.error('logout request failed', err);
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
    const tokens = getStoredTokens();
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
