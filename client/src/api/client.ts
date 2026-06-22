// Thin fetch wrapper. Always sends cookies so the owner session is included.
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Prefix API calls with the app's base path (e.g. "/ll") when hosted under a
// sub-path. import.meta.env.BASE_URL is "/" at root, "/ll/" under a sub-path.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    credentials: 'include',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const data = await res.json();
      msg = data.error ?? msg;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};
