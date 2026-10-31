export interface AuthUser { id: string; email: string; displayName: string; createdAt: string }
export interface AuthResult { token: string; expiresAt: string; user: AuthUser }
export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}
const baseUrl = (import.meta.env?.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function send(path: string, body?: object, token?: string) {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/auth${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch { throw new AuthError('Serverə qoşulmaq olmadı. Yenidən cəhd edin.', 0); }
  if (!response.ok) {
    let message = response.status === 401 ? 'Email və ya parol yanlışdır.' : response.status === 429 ? 'Çox sayda cəhd etdiniz. Bir qədər sonra yenidən cəhd edin.' : 'Sorğu yerinə yetirilmədi.';
    try { const data = await response.json(); if (typeof data === 'string') message = data; }
    catch { /* Daxili server məlumatını istifadəçiyə göstərmirik. */ }
    throw new AuthError(message, response.status);
  }
  return response.json();
}
export async function register(email: string, password: string, displayName: string, confirmPassword: string): Promise<AuthUser> {
  return send('/register', { email, password, displayName, confirmPassword });
}
export async function login(email: string, password: string): Promise<AuthResult> {
  return send('/login', { email, password });
}
export async function me(token: string): Promise<AuthUser> { return send('/me', undefined, token); }

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return send('/forgot-password', { email });
}
export async function resetPassword(email: string, token: string, password: string, confirmPassword: string): Promise<{ message: string }> {
  return send('/reset-password', { email, token, password, confirmPassword });
}
export async function logout(token: string): Promise<void> {
  await send('/logout', {}, token);
}
