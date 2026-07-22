import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@services/query/queryClient";
import { enqueueMutation } from "@services/offline/mutationQueue";
import { useNetworkStatus } from "@hooks/useNetworkStatus";
import type { LabourType } from "@constants/config";
import {
  createWorker,
  deactivateWorker,
  deleteWorker,
  getWorker,
  listWorkers,
  reactivateWorker,
  updateWorker,
  type CreateWorkerPayload,
  type UpdateWorkerPayload,
} from "../api/workersApi";

export function useWorkersQuery(farmId: string, type: LabourType) {
  return useQuery({
    queryKey: queryKeys.workers(farmId, type),
    queryFn: () => listWorkers(farmId, { type }),
    enabled: !!farmId,
  });
}

export function useWorkerQuery(workerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.worker(workerId ?? ""),
    queryFn: () => getWorker(workerId as string),
    enabled: !!workerId,
  });
}

function useInvalidateWorkers(farmId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["workers", farmId] });
    queryClient.invalidateQueries({ queryKey: queryKeys.workerCounts(farmId) });
  };
}

/**
 * Creating a worker needs connectivity (we need the server-generated id
 * before a photo can be uploaded/linked), so unlike attendance/stock/sales
 * this isn't queued offline — the network banner + disabled submit button
 * (see WorkerForm) make that clear before the user tries.
 */
export function useCreateWorker(farmId: string) {
  const invalidate = useInvalidateWorkers(farmId);
  return useMutation({
    mutationFn: (payload: CreateWorkerPayload) => createWorker(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateWorker(farmId: string, workerId: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateWorkers(farmId);
  return useMutation({
    mutationFn: (payload: UpdateWorkerPayload) => updateWorker(workerId, payload),
    onSuccess: (worker) => {
      queryClient.setQueryData(queryKeys.worker(workerId), worker);
      invalidate();
    },
  });
}

/** Deactivate/reactivate are simple status flips — safe to queue offline
 * like attendance/stock entries, since there's no id-generation dependency. */
export function useSetWorkerStatus(farmId: string, workerId: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateWorkers(farmId);
  const { isOnline } = useNetworkStatus();

  return useMutation({
    mutationFn: async (status: "active" | "inactive") => {
      if (!isOnline) {
        enqueueMutation("workers", "update", { id: workerId, status });
        return null;
      }
      return status === "active" ? reactivateWorker(workerId) : deactivateWorker(workerId);
    },
    onSuccess: (worker) => {
      if (worker) queryClient.setQueryData(queryKeys.worker(workerId), worker);
      invalidate();
    },
  });
}

export function useDeleteWorker(farmId: string) {
  const invalidate = useInvalidateWorkers(farmId);
  return useMutation({
    mutationFn: (workerId: string) => deleteWorker(workerId),
    onSuccess: invalidate,
  });
}
