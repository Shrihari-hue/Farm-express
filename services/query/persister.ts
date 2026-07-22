import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { mmkvStorageAdapter } from "@services/storage/mmkv";

/**
 * Persists the whole React Query cache to MMKV so the dashboard, stock
 * counts, sales, etc. are visible instantly (and readable) even when the
 * app is opened with zero connectivity — the core of our offline story.
 */
export const queryPersister = createSyncStoragePersister({
  storage: mmkvStorageAdapter,
  key: "FARM_EXPRESS_QUERY_CACHE",
  throttleTime: 1000,
});
