import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { keyValueStorageAdapter } from "@services/storage/keyValueStore";

/**
 * Persists the whole React Query cache to AsyncStorage so the dashboard,
 * stock counts, sales, etc. are visible instantly (and readable) even when
 * the app is opened with zero connectivity — the core of our offline story.
 */
export const queryPersister = createAsyncStoragePersister({
  storage: keyValueStorageAdapter,
  key: "FARM_EXPRESS_QUERY_CACHE",
  throttleTime: 1000,
});
