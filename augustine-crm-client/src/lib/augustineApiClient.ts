export type ApiRole = 'Viewer' | 'Reviewer' | 'Admin';

export interface NormalizedApiError {
  status: number;
  code?: string;
  message: string;
  raw?: unknown;
}

export interface ApiClientOptions {
  /** Override base URL (defaults to NEXT_PUBLIC_API_URL without trailing slash). */
  baseUrl?: string;
  /** Explicit API key; falls back to env or local storage. */
  apiKey?: string | null;
  /** Explicit Bearer token. */
  bearerToken?: string | null;
}

const DEFAULT_TIMEOUT_MS = 30_000;

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';
  return base.replace(/\/$/, '') || '';
}

function getStoredValue(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(key);
    return v && v.length ? v : null;
  } catch {
    return null;
  }
}

function getEnvApiKey(): string | null {
  if (typeof process === 'undefined') return null;
  return process.env.NEXT_PUBLIC_AUGUSTINE_API_KEY ?? null;
}

function resolveAuthHeaders(opts?: ApiClientOptions): HeadersInit {
  const headers: HeadersInit = {};

  const apiKey = opts?.apiKey ?? getStoredValue('augustine-api-key') ?? getEnvApiKey();
  const bearer =
    opts?.bearerToken ??
    getStoredValue('augustine-access-token');

  if (apiKey) {
    (headers as Record<string, string>)['X-API-Key'] = apiKey;
  } else if (bearer) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${bearer}`;
  }

  return headers;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  if (!timeoutMs) return promise;
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        createNormalizedError(0, {
          detail: {
            code: 'TIMEOUT',
            message: 'Request timed out',
          },
        })
      );
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId!));
}

function parseErrorBody(body: unknown): { code?: string; message: string } {
  if (!body) {
    return { message: 'Unknown error' };
  }
  if (typeof body === 'string') {
    return { message: body };
  }
  if (typeof body === 'object') {
    const anyBody = body as any;
    if (typeof anyBody.detail === 'string') {
      return { message: anyBody.detail };
    }
    if (anyBody.detail && typeof anyBody.detail === 'object') {
      const code = typeof anyBody.detail.code === 'string' ? anyBody.detail.code : undefined;
      const message =
        typeof anyBody.detail.message === 'string'
          ? anyBody.detail.message
          : JSON.stringify(anyBody.detail);
      return { code, message };
    }
    if (typeof anyBody.message === 'string') {
      return { message: anyBody.message };
    }
    try {
      return { message: JSON.stringify(body) };
    } catch {
      return { message: 'Unknown error' };
    }
  }
  return { message: String(body) };
}

export function createNormalizedError(
  status: number,
  body: unknown,
  fallbackMessage?: string
): NormalizedApiError {
  const parsed = parseErrorBody(body);
  const message = parsed.message || fallbackMessage || 'Request failed';
  return {
    status,
    code: parsed.code,
    message,
    raw: body,
  };
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
  opts?: ApiClientOptions
): Promise<T> {
  const base = opts?.baseUrl ?? getBaseUrl();
  const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers ?? {}),
    ...resolveAuthHeaders(opts),
  };

  const requestPromise = fetch(url, {
    ...init,
    headers,
  }).then(async (res) => {
    const body = await parseJsonSafe(res);
    if (!res.ok) {
      const err = createNormalizedError(res.status, body);
      if (typeof window !== 'undefined' && err.status === 401) {
        try {
          window.localStorage.removeItem('augustine-access-token');
          window.localStorage.removeItem('augustine-auth-user');
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
        } catch {
          // ignore storage errors
        }
      }
      throw err;
    }
    return body as T;
  });

  return withTimeout(requestPromise, init?.timeoutMs);
}

export function apiGet<T>(path: string, opts?: ApiClientOptions & { timeoutMs?: number }) {
  const { timeoutMs, ...rest } = opts ?? {};
  return apiRequest<T>(
    path,
    {
      method: 'GET',
      timeoutMs,
    } as any,
    rest
  );
}

export function apiPost<T, B = unknown>(
  path: string,
  body?: B,
  opts?: ApiClientOptions & { timeoutMs?: number }
) {
  const { timeoutMs, ...rest } = opts ?? {};
  return apiRequest<T>(
    path,
    {
      method: 'POST',
      body: body != null ? JSON.stringify(body) : undefined,
      timeoutMs,
    } as any,
    rest
  );
}

export function apiPut<T, B = unknown>(
  path: string,
  body?: B,
  opts?: ApiClientOptions & { timeoutMs?: number }
) {
  const { timeoutMs, ...rest } = opts ?? {};
  return apiRequest<T>(
    path,
    {
      method: 'PUT',
      body: body != null ? JSON.stringify(body) : undefined,
      timeoutMs,
    } as any,
    rest
  );
}

export function apiDelete<T>(
  path: string,
  opts?: ApiClientOptions & { timeoutMs?: number }
) {
  const { timeoutMs, ...rest } = opts ?? {};
  return apiRequest<T>(
    path,
    {
      method: 'DELETE',
      timeoutMs,
    } as any,
    rest
  );
}

