import type { AppUser } from "@app-types/models";
import { apiClient } from "./client";
import { setToken } from "./tokenStorage";

/**
 * Thin, framework-free wrappers around the new backend's auth routes. No
 * React here — `features/auth/hooks` wraps these in TanStack Query
 * mutations and handles navigation/toast side effects.
 */

export interface AuthResult {
  token: string;
  user: AppUser;
}

export async function register(email: string, password: string): Promise<AuthResult> {
  const result = await apiClient.post<AuthResult>("/api/auth/register", { email, password });
  await setToken(result.token);
  return result;
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const result = await apiClient.post<AuthResult>("/api/auth/login", { email, password });
  await setToken(result.token);
  return result;
}

/** Validates the stored token and returns the caller's own user document. */
export async function getMe(): Promise<AppUser> {
  const { user } = await apiClient.get<{ user: AppUser }>("/api/auth/me");
  return user;
}

/** Creates the caller's farm and links their user document to it, via the
 * atomic `POST /api/profile/complete` endpoint (replaces the
 * `complete_owner_profile` Postgres RPC). Self-registered users always
 * become the `owner` of a brand-new farm. */
export async function completeProfile(params: { fullName: string; farmName: string }): Promise<AppUser> {
  const { user } = await apiClient.post<{ user: AppUser }>("/api/profile/complete", params);
  return user;
}
