import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Key-value storage for non-sensitive app state (UI preferences, cached
 * lookups, the TanStack Query persister). Auth tokens must NOT go here —
 * use `services/storage/secureStore.ts`.
 *
 * Backed by AsyncStorage rather than MMKV. MMKV v2 (JSI) is incompatible
 * with React Native's New Architecture — under Bridgeless mode it can't
 * find `global.nativeCallSyncHook` and throws, mistaking Bridgeless for a
 * remote JS debugger. MMKV v3/v4 (Nitro-based) supports New Architecture in
 * principle, but its native module has a live, unresolved autolinking bug
 * in Expo/EAS builds ("Failed to get NitroModules") — see
 * https://github.com/mrousavy/react-native-mmkv/issues/1014. Since
 * `react-native-reanimated` v4 requires New Architecture (no old-arch
 * support), disabling it isn't an option either. AsyncStorage sidesteps
 * all of this: it's already a dependency, fully async-native, and has no
 * new-arch/Nitro linking risk. It's slower than MMKV's synchronous reads,
 * but nothing here is on a hot path that needs sub-millisecond access.
 */
export const keyValueStorageAdapter = {
  getItem: (key: string): Promise<string | null> => AsyncStorage.getItem(key),
  setItem: (key: string, value: string): Promise<void> => AsyncStorage.setItem(key, value),
  removeItem: (key: string): Promise<void> => AsyncStorage.removeItem(key),
};
