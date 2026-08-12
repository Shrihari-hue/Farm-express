import * as SecureStore from "expo-secure-store";

/**
 * Encrypted, Keychain/Keystore-backed storage. Used by
 * `services/api/tokenStorage.ts` to persist the backend's JWT securely.
 */
export const secureStorageAdapter = {
  getItem: (key: string): Promise<string | null> => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string): Promise<void> => SecureStore.setItemAsync(key, value),
  removeItem: (key: string): Promise<void> => SecureStore.deleteItemAsync(key),
};
