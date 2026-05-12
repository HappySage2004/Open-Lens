const BASE_URL = 'http://localhost:8000';

// Plain Error with a status property — avoids `erasableSyntaxOnly` restriction on class syntax.
export interface ApiError extends Error { status: number }

export function makeApiError(status: number, message: string): ApiError {
  const err = new Error(message) as ApiError;
  err.name = 'ApiError';
  err.status = status;
  return err;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw makeApiError(res.status, text);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const WS_BASE_URL = 'ws://localhost:8000';
