import NetInfo from "@react-native-community/netinfo";
import { supabase } from "@services/supabase/client";
import { queryClient } from "@services/query/queryClient";
import { logger } from "@utils/logger";
import { OFFLINE_SYNC_INTERVAL_MS } from "@constants/config";
import {
  countPendingMutations,
  getPendingMutations,
  markMutationFailed,
  removeMutation,
} from "./mutationQueue";

/**
 * Table name -> Supabase table mapping for queued entities. Feature modules
 * register themselves here as they're built (Steps 6-11), keeping the sync
 * engine itself generic and unaware of feature-specific logic.
 */
const TABLE_MAP: Record<string, string> = {
  attendance: "attendance",
  stock_history: "stock_history",
  sales: "sales",
  expenses: "expenses",
  salary_advances: "salary_advances",
};

let syncTimer: ReturnType<typeof setInterval> | null = null;
let isSyncing = false;

async function replayOne(mutation: ReturnType<typeof getPendingMutations>[number]): Promise<void> {
  const table = TABLE_MAP[mutation.entityType];
  if (!table) {
    logger.warn("Unknown queued entity type, dropping mutation", mutation.entityType);
    removeMutation(mutation.id);
    return;
  }

  if (mutation.operation === "insert" || mutation.operation === "update") {
    const { error } = await supabase.from(table).upsert(mutation.payload);
    if (error) throw error;
  } else if (mutation.operation === "delete") {
    const { error } = await supabase.from(table).delete().eq("id", (mutation.payload as { id: string }).id);
    if (error) throw error;
  }

  removeMutation(mutation.id);
}

/** Drains the outbox in FIFO order. Stops at the first failure so
 * dependent writes (e.g. edits after an insert) never get reordered. */
export async function syncPendingMutations(): Promise<void> {
  if (isSyncing) return;
  const net = await NetInfo.fetch();
  if (!net.isConnected || !net.isInternetReachable) return;

  isSyncing = true;
  try {
    const pending = getPendingMutations();
    if (pending.length === 0) return;

    for (const mutation of pending) {
      try {
        await replayOne(mutation);
      } catch (error) {
        markMutationFailed(mutation.id, error instanceof Error ? error.message : String(error));
        logger.error("Sync failed for mutation", mutation.entityType, error);
        break; // preserve order — retry the rest on the next tick
      }
    }

    // Any screen reading via TanStack Query should refetch now that the
    // server has fresher data than what was cached offline.
    await queryClient.invalidateQueries();
  } finally {
    isSyncing = false;
  }
}

/** Starts the background sync loop: retries on an interval AND immediately
 * whenever connectivity is restored. Call once from the root layout. */
export function startSyncEngine(): () => void {
  const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable) {
      void syncPendingMutations();
    }
  });

  syncTimer = setInterval(() => {
    void syncPendingMutations();
  }, OFFLINE_SYNC_INTERVAL_MS);

  return () => {
    unsubscribeNetInfo();
    if (syncTimer) clearInterval(syncTimer);
  };
}

export { countPendingMutations };
