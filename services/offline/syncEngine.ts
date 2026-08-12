import NetInfo from "@react-native-community/netinfo";
import { queryClient } from "@services/query/queryClient";
import { logger } from "@utils/logger";
import { OFFLINE_SYNC_INTERVAL_MS } from "@constants/config";
import type { AttendanceStatus } from "@constants/config";
import * as workersApi from "@features/labour/api/workersApi";
import * as attendanceApi from "@features/attendance/api/attendanceApi";
import {
  countPendingMutations,
  getPendingMutations,
  markMutationFailed,
  removeMutation,
  type QueuedMutation,
} from "./mutationQueue";

interface QueuedAttendancePayload {
  farmId: string;
  workerId: string;
  date: string;
  status: AttendanceStatus;
  todaysWage: number | null;
  workDone: string | null;
  remarks: string | null;
  markedBy: string;
}

interface QueuedWorkerStatusPayload {
  id: string;
  status: "active" | "inactive";
}

/**
 * Replays one queued mutation against the new backend, dispatched off
 * `entity_type`/`operation` and calling the same rewritten feature API
 * functions the online path uses (`workersApi`/`attendanceApi`) — replacing
 * the old raw `supabase.from(table).upsert/delete` calls.
 *
 * `stock_history`/`sales`/`expenses`/`salary_advances` aren't registered
 * here (unlike the old Supabase-era `TABLE_MAP`): no feature UI enqueues
 * those entity types yet (Steps 8-11 aren't built), so there's nothing to
 * replay for them today. Add a `case` here once those features queue
 * mutations of their own.
 */
async function replayOne(mutation: QueuedMutation): Promise<void> {
  switch (mutation.entityType) {
    case "attendance": {
      if (mutation.operation === "insert" || mutation.operation === "update") {
        const payload = mutation.payload as unknown as QueuedAttendancePayload;
        await attendanceApi.markAttendance(payload);
      } else {
        logger.warn("Unsupported queued attendance operation, dropping mutation", mutation.operation);
      }
      break;
    }
    case "workers": {
      if (mutation.operation === "update") {
        const payload = mutation.payload as unknown as QueuedWorkerStatusPayload;
        await workersApi.updateWorker(payload.id, { status: payload.status });
      } else {
        logger.warn("Unsupported queued workers operation, dropping mutation", mutation.operation);
      }
      break;
    }
    default:
      logger.warn("Unknown queued entity type, dropping mutation", mutation.entityType);
      break;
  }

  removeMutation(mutation.id);
}

let syncTimer: ReturnType<typeof setInterval> | null = null;
let isSyncing = false;

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
