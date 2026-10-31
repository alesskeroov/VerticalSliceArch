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
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && getExpiry(token) > Date.now()) return token;
  localStorage.removeItem(TOKEN_KEY);
  return null;
}
export function saveToken(token: string) {
  // Sadə demo üçün localStorage seçilib; XSS tokeni oxuya bilər. Real alternativ httpOnly cookie-dir.
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}
