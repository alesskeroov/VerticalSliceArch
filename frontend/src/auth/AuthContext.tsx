import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as api from '../api/authApi';
import type { AuthResult, AuthUser } from '../api/authApi';
import { clearSession, getExpiry, getStoredToken, saveToken, UNAUTHORIZED_EVENT } from './tokenStorage';

type AuthState = {
  user: AuthUser | null; token: string | null; loading: boolean; error: string;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
};
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState('');
  useEffect(() => {
    const reset = () => { setToken(null); setUser(null); setLoading(false); setError(''); };
    window.addEventListener(UNAUTHORIZED_EVENT, reset);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, reset);
  }, []);
  useEffect(() => {
    if (!token || user) { setLoading(false); return; }
    let active = true;
    api.me(token).then(current => { if (active) setUser(current); }).catch(err => {
      if (!active) return;
      if (err instanceof api.AuthError && err.status === 401) clearSession();
      else setError(err.message);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // Token dəyişəndə sessiya yoxlanır; login cavabı artıq user veribsə əlavə sorğu lazım deyil.
  }, [token]);
  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(clearSession, Math.max(0, getExpiry(token) - Date.now()));
    return () => window.clearTimeout(timer);
  }, [token]);
  function saveSession(result: AuthResult) {
    saveToken(result.token); setToken(result.token); setUser(result.user); setError(''); setLoading(false);
  }
  async function login(email: string, password: string) { saveSession(await api.login(email, password)); }
  async function register(email: string, password: string, displayName: string) {
    await api.register(email, password, displayName);
    await login(email, password);
  }
  return <AuthContext.Provider value={{ user, token, loading, error, login, register, logout: clearSession }}>
    {children}
  </AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider tapılmadı.');
  return context;
}
