import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, saveToken } from '../services/api.js';

// ─── Auth context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const USER_KEY = 'gvhUser';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Persist user object across page reloads
  useEffect(() => {
    if (user) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(USER_KEY);
      clearToken();
    }
  }, [user]);

  // ── Login (all roles — calls real API) ──────────────────────────────────
  const login = useCallback(async (email, password, role) => {
    try {
      const data = await api.post('/api/auth/login', { email, password, role });
      saveToken(data.token);
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (error) {
      return { ok: false, error: error.message || 'Could not sign you in.' };
    }
  }, []);

  const completeLogin = useCallback((user, token) => {
    saveToken(token);
    setUser(user);
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    clearToken();
    sessionStorage.removeItem(USER_KEY);
  }, []);

  const value = useMemo(() => ({ user, login, completeLogin, logout }), [user, login, completeLogin, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}

// ─── Thin wrapper so old imports don't break ─────────────────────────────────
// Pages that used useDemoStore() for display data now fetch from the API.
// We keep a no-op provider so the import works without crashing.
const DemoStoreContext = createContext({ store: {}, setStore: () => {} });

export function DemoStoreProvider({ children }) {
  return <DemoStoreContext.Provider value={{ store: {}, setStore: () => {} }}>{children}</DemoStoreContext.Provider>;
}

export function useDemoStore() {
  return useContext(DemoStoreContext);
}
