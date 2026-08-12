import { secureStorageAdapter } from "@services/storage/secureStore";

/** Encrypted Keychain/Keystore key the JWT is persisted under. */
const AUTH_TOKEN_KEY = "auth-token";

export async function getToken(): Promise<string | null> {
  return secureStorageAdapter.getItem(AUTH_TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await secureStorageAdapter.setItem(AUTH_TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await secureStorageAdapter.removeItem(AUTH_TOKEN_KEY);
}
