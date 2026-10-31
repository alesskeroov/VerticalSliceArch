import { clearSession, getStoredToken } from '../auth/tokenStorage';
import type { Todo, TodoFilter } from '../types/todo';

// Ünvanı koddan ayırırıq ki, fərqli mühitlərdə yalnız .env dəyişsin.
const baseUrl = (import.meta.env?.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function send(path: string, options?: RequestInit) {
  let response: Response;
  try {
    const token = getStoredToken();
    const headers = new Headers(options?.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    response = await fetch(`${baseUrl}/api/todos${path}`, { ...options, headers });
    // Köhnə sorğunun 401-i daha yeni giriş sessiyasını silməsin.
    if (response.status === 401 && getStoredToken() === token) clearSession();
  } catch {
    throw new Error('Serverə qoşulmaq olmadı. Backend-in işlədiyini yoxlayın.');
  }
  if (!response.ok) {
    const text = await response.text();
    // Backend-in sadə 400/404 mesajları JSON sətiridir.
    let message = 'Sorğu yerinə yetirilmədi. Yenidən cəhd edin.';
    try {
      const data = JSON.parse(text);
      if (typeof data === 'string') message = data;
    } catch { /* HTML və daxili xəta mətnini istifadəçiyə göstərmirik. */ }
    throw new Error(message);
  }
  // DELETE 204 qaytarır; boş gövdəni JSON kimi oxumuruq.
  return response.status === 204 ? undefined : response.json();
}

export async function getTodos(filter: TodoFilter = 'all'): Promise<Todo[]> {
  return send(`?filter=${filter}`);
}
export async function createTodo(title: string): Promise<Todo> {
  return send('', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }) });
}
export async function updateTodo(id: string, title: string): Promise<Todo> {
  return send(`/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }) });
}
export async function toggleTodo(id: string): Promise<Todo> {
  return send(`/${id}/toggle`, { method: 'PATCH' });
}
export async function deleteTodo(id: string): Promise<void> {
  await send(`/${id}`, { method: 'DELETE' });
}

