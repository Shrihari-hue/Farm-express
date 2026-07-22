import { MMKV } from "react-native-mmkv";

/**
 * Fast, synchronous key-value storage for non-sensitive app state
 * (UI preferences, cached lookups, the TanStack Query persister).
 * Auth tokens must NOT go here — use `services/storage/secureStore.ts`.
 */
export const storage = new MMKV({ id: "farm-express-storage" });

/** Thin adapter matching the (async) Storage interface TanStack Query's
 * persister and Zustand's `persist` middleware expect. */
export const mmkvStorageAdapter = {
  getItem: (key: string): string | null => storage.getString(key) ?? null,
  setItem: (key: string, value: string): void => {
    storage.set(key, value);
  },
  removeItem: (key: string): void => {
    storage.delete(key);
  },
};
