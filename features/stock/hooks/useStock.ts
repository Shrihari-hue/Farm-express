import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@services/query/queryClient";
import { useNetworkStatus } from "@hooks/useNetworkStatus";
import { enqueueMutation } from "@services/offline/mutationQueue";
import type { StockCategory } from "@constants/config";
import {
  createStockItem,
  getStockHistory,
  getStockItem,
  listStockItems,
  logStockHistory,
  updateStockItem,
  type CreateStockItemPayload,
  type LogStockHistoryPayload,
  type UpdateStockItemPayload,
} from "../api/stockApi";

export function useStockItems(farmId: string, category?: StockCategory) {
  return useQuery({
    queryKey: [...queryKeys.stock(farmId), category ?? "all"],
    queryFn: () => listStockItems(category),
    enabled: !!farmId,
  });
}

export function useStockItem(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.stockItem(id ?? ""),
    queryFn: () => getStockItem(id as string),
    enabled: !!id,
  });
}

export function useStockHistory(stockItemId: string | undefined, startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...queryKeys.stockHistory(stockItemId ?? ""), startDate, endDate],
    queryFn: () => getStockHistory(stockItemId as string, startDate, endDate),
    enabled: !!stockItemId,
  });
}

export function useCreateStockItem(farmId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStockItemPayload) => createStockItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stock(farmId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockSummary(farmId) });
    },
  });
}

export function useUpdateStockItem(farmId: string, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStockItemPayload) => updateStockItem(id, payload),
    onSuccess: (item) => {
      queryClient.setQueryData(queryKeys.stockItem(id), item);
      queryClient.invalidateQueries({ queryKey: queryKeys.stock(farmId) });
    },
  });
}

/**
 * Logs one day's harvested/sold/damaged entry for a stock item. Queues
 * offline like `useMarkAttendance` — the payload shape matches what
 * `syncEngine.replayOne` expects to hand back to `logStockHistory` on replay.
 */
export function useLogStockHistory(farmId: string) {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();

  return useMutation({
    mutationFn: async (payload: LogStockHistoryPayload) => {
      if (!isOnline) {
        enqueueMutation("stock_history", "insert", { ...payload });
        return null;
      }
      return logStockHistory(payload);
    },
    onSuccess: (result, payload) => {
      if (result) {
        queryClient.setQueryData(queryKeys.stockItem(payload.stockItemId), result.stockItem);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.stock(farmId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockHistory(payload.stockItemId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockSummary(farmId) });
    },
  });
}
