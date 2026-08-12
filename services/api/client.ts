import { ENV } from "@constants/config";
import { getToken } from "./tokenStorage";

/**
 * Small fetch wrapper for the Farm Express Node/Express backend. No new
 * dependency — just the platform `fetch`. Attaches the stored JWT as
 * `Authorization: Bearer <token>` when present, parses JSON responses, and
 * throws an `Error` with the server's `{ error }` message on non-2xx
 * responses (falling back to `statusText` if the body isn't JSON).
 */

interface ErrorBody {
  error?: string;
}

function isErrorBody(value: unknown): value is ErrorBody {
  return typeof value === "object" && value !== null && "error" in value;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string> | undefined) ?? {}),
  };

  const response = await fetch(`${ENV.apiUrl}${path}`, { ...options, headers });
  const body = await parseBody(response);

  if (!response.ok) {
    const message = isErrorBody(body) && typeof body.error === "string" ? body.error : response.statusText || "Request failed";
    throw new Error(message);
  }

  return body as T;
}

function toBody(data: unknown): string | undefined {
  return data !== undefined ? JSON.stringify(data) : undefined;
}

export const apiClient = {
  get: <T>(path: string): Promise<T> => request<T>(path, { method: "GET" }),
  post: <T>(path: string, data?: unknown): Promise<T> => request<T>(path, { method: "POST", body: toBody(data) }),
  put: <T>(path: string, data?: unknown): Promise<T> => request<T>(path, { method: "PUT", body: toBody(data) }),
  patch: <T>(path: string, data?: unknown): Promise<T> => request<T>(path, { method: "PATCH", body: toBody(data) }),
  del: <T>(path: string): Promise<T> => request<T>(path, { method: "DELETE" }),
};
