'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { adminApi, AdminUser, tokenStore } from '@/lib/admin-api';

interface AuthState {
  user: AdminUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Restore the session, then confirm the token is still valid with the API.
  useEffect(() => {
    const cached = tokenStore.getUser();
    if (!cached || !tokenStore.get()) {
      setReady(true);
      return;
    }
    setUser(cached);
    adminApi
      .me()
      .then(setUser)
      .catch(() => {
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  // Anything under /admin except the login page requires a session.
  useEffect(() => {
    if (!ready) return;
    const isLogin = pathname === '/admin/login';
    if (!user && !isLogin) router.replace('/admin/login');
    if (user && isLogin) router.replace('/admin');
  }, [ready, user, pathname, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await adminApi.login(email, password);
      tokenStore.set(res.accessToken, res.user);
      setUser(res.user);
      router.replace('/admin');
    },
    [router],
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    router.replace('/admin/login');
  }, [router]);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
}
