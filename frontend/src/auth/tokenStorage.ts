const TOKEN_KEY = 'matchday-token';
export const UNAUTHORIZED_EVENT = 'matchday-unauthorized';

export function getExpiry(token: string): number {
  try {
    // Burada yalnız müddəti oxuyuruq; imzanı həmişə backend yoxlayır.
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : 0;
  } catch { return 0; }
}
export function getStoredToken(): string | null {
  // Discard tokens persisted by older releases.
  localStorage.removeItem(TOKEN_KEY);
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token && getExpiry(token) > Date.now()) return token;
  sessionStorage.removeItem(TOKEN_KEY);
  return null;
}
export function saveToken(token: string) {
  // Session ends when this browser tab closes; scripts must still be protected against XSS.
  sessionStorage.setItem(TOKEN_KEY, token);
}
export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}
