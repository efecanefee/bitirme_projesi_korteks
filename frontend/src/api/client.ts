import { useAuthStore } from '@/features/auth/authStore';
import type { ApiHata } from './types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
export const API_PREFIX = '/api/v1';

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type Json = Record<string, unknown> | unknown[];

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: Json | FormData;
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${BASE_URL}${API_PREFIX}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as Partial<ApiHata> & { detail?: unknown };
    if (typeof data.detail === 'string') return data.detail;
    // FastAPI doğrulama hataları: detail bir dizi olarak gelir
    if (Array.isArray(data.detail)) return 'Gönderilen bilgiler geçersiz.';
  } catch {
    /* gövde JSON değil */
  }
  if (res.status >= 500) return 'Sunucuya şu an ulaşılamıyor. Biraz sonra tekrar dene.';
  return `İstek başarısız oldu (${res.status}).`;
}

/**
 * Tüm API çağrılarının geçtiği tek nokta: JWT ekler, 401'de oturumu kapatır,
 * FastAPI hata gövdesini okunur bir mesaja çevirir.
 */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, headers, ...rest } = options;
  const token = useAuthStore.getState().token;
  const isForm = body instanceof FormData;

  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  if (res.status === 401 && token) {
    useAuthStore.getState().logout();
  }
  if (!res.ok) throw new ApiError(res.status, await readError(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
