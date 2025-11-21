import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { wsClient } from '../lib/wsClient';
import { API_BASE_URL, API_UNCONFIGURED } from '../lib/env';

type User = { user_id: number; name: string; role: string } | null;
const USER_CACHE_KEY = 'auth_cached_user';

const readCachedUser = (): User => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeCachedUser = (user: User) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
    }
  } catch {}
};
type AuthContextValue = {
  token: string | null; // always null with cookie-based auth; kept for backward compat
  user: User;
  loading: boolean;
  initializing: boolean;
  logout: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>; // returns {} in cookie mode
  refreshAccessToken: () => Promise<any>; // noop in cookie mode
  isAuthenticated: boolean;
  refreshUser: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // token/refresh no longer used; kept for API compatibility
  const [token] = useState<string | null>(null);
  const [refreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(() => {
    try {
      return readCachedUser();
    } catch {
      return null;
    }
  });
  const [allowOffline, setAllowOffline] = useState<boolean>(() => !!readCachedUser());
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const getCsrfToken = (): string | undefined => {
    try {
      const m = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
      if (m && m[1]) return decodeURIComponent(m[1]);
    } catch {}
    return undefined;
  };

  const notifyOffline = useCallback(async (reason: string = 'logout') => {
    try {
      const payload: any = { ts: new Date().toISOString(), reason };
      if (user?.user_id) payload.user_id = user.user_id;
      const headers: any = { 'Content-Type': 'application/json' };
      const csrf = getCsrfToken();
      if (csrf) headers['X-CSRF-Token'] = csrf;
      await fetch(`${API_BASE_URL}/presence/offline`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch {}
  }, [user?.user_id]);

  const clearSession = useCallback(() => {
    setUser(null);
    writeCachedUser(null);
    setAllowOffline(false);
    setInitializing(false);
    try {
      wsClient.setAutoReconnect(false);
      wsClient.close();
    } catch {}
  }, []);

  const refreshAccessToken = useCallback(async () => {
    // With HttpOnly cookies, server handles token rotation; optionally ping endpoint
    try {
      const headers: any = {};
      const csrf = getCsrfToken();
      if (csrf) headers['X-CSRF-Token'] = csrf;
      const resp = await fetch(`${API_BASE_URL}/refresh-token`, { method: 'POST', credentials: 'include', headers });
      if (!resp.ok) return null;
      return await resp.json().catch(() => null);
    } catch {
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (API_UNCONFIGURED) {
      setUser(null);
      return false;
    }
    try {
      let resp = await fetch(`${API_BASE_URL}/me`, { credentials: 'include' });
      if (resp.status === 401) {
        try {
          const headers: any = {};
          const csrf = getCsrfToken();
          if (csrf) headers['X-CSRF-Token'] = csrf;
          const r = await fetch(`${API_BASE_URL}/refresh-token`, {
            method: 'POST',
            credentials: 'include',
            headers,
          });
          if (r.ok) {
            resp = await fetch(`${API_BASE_URL}/me`, { credentials: 'include' });
          }
        } catch {}
      }
      if (resp.ok) {
        const data = await resp.json();
        if (data && (data.user_id || data.id)) {
          const nextUser = {
            user_id: data.user_id ?? data.id,
            name: data.name ?? data.username ?? 'user',
            role: data.role ?? 'user',
          };
          setUser(nextUser);
          writeCachedUser(nextUser);
          setAllowOffline(true);
          try { wsClient.setAutoReconnect(true); } catch {}
          wsClient.connect().catch(() => {});
          return true;
        }
      }
      if (resp.status === 401) {
        setUser(null);
        writeCachedUser(null);
        setAllowOffline(false);
      }
      return false;
    } catch {
      // Keep cached user on network errors so UI не пропадает при недоступном API
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refreshUser();
      if (!cancelled) setInitializing(false);
    })();
    return () => { cancelled = true; };
  }, [refreshUser]);

  // No token scheduling in cookie mode

  // login(name,password) removed: Telegram login sets cookies server-side

  const logout = useCallback(async () => {
    if (API_UNCONFIGURED) {
      clearSession();
      return;
    }
    try {
      // Mark offline explicitly before logout
      await notifyOffline('logout');
      try { if (wsClient.isReady()) wsClient.send('presence.offline', { ts: Date.now(), reason: 'logout' }); } catch {}
      const headers: any = {};
      const csrf = getCsrfToken();
      if (csrf) headers['X-CSRF-Token'] = csrf;
      await fetch(`${API_BASE_URL}/logout`, { method: 'POST', credentials: 'include', headers });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearSession();
    }
  }, [clearSession, notifyOffline]);

  const getAuthHeaders = useCallback((): Record<string, string> => ({}), []);

  return (
    <AuthContext.Provider value={{
      token,
      user,
      loading,
      initializing,
      logout,
      getAuthHeaders,
      refreshAccessToken,
      isAuthenticated: !!user || allowOffline,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
