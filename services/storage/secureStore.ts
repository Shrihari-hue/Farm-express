import * as SecureStore from "expo-secure-store";

/**
 * Encrypted, Keychain/Keystore-backed storage for the Supabase session.
 * Supabase's JS client expects a storage object with getItem/setItem/
 * removeItem — this adapter satisfies that contract securely.
 */
export const secureStorageAdapter = {
  getItem: (key: string): Promise<string | null> => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string): Promise<void> => SecureStore.setItemAsync(key, value),
  removeItem: (key: string): Promise<void> => SecureStore.deleteItemAsync(key),
};
