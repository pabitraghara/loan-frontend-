import type { ApiError } from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiRequestError extends Error {
  readonly payload: ApiError;
  constructor(payload: ApiError) {
    super(payload.message || 'Request failed');
    this.payload = payload;
  }
  /** Field-keyed messages the form renders inline. */
  get fieldErrors() {
    return this.payload.errors ?? {};
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      cache: 'no-store',
    });
  } catch {
    throw new ApiRequestError({
      statusCode: 0,
      message: 'We could not reach our servers. Check your connection and try again.',
    });
  }

  const text = await res.text();
  const body = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new ApiRequestError({ statusCode: res.status, ...body });
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
};

export { BASE as API_BASE };
