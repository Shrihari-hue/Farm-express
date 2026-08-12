import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@services/query/queryClient";
import { useNetworkStatus } from "@hooks/useNetworkStatus";
import { enqueueMutation } from "@services/offline/mutationQueue";
import { deleteSale, listSales, recordSale, type RecordSalePayload } from "../api/salesApi";

export function useSales(farmId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: queryKeys.sales(farmId, `${startDate}_${endDate}`),
    queryFn: () => listSales(startDate, endDate),
    enabled: !!farmId,
  });
}

/**
 * Records a sale, deducting the sold quantity from the stock item's balance
 * server-side. Queued offline like attendance/stock entries — unlike
 * creating a worker, a sale doesn't need a server-generated id before the
 * user can move on, so there's no reason to force connectivity.
 */
export function useRecordSale(farmId: string) {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();

  return useMutation({
    mutationFn: async (payload: RecordSalePayload) => {
      if (!isOnline) {
        enqueueMutation("sales", "insert", { ...payload });
        return null;
      }
      return recordSale(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", farmId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock(farmId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockSummary(farmId) });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "sales-total", farmId] });
    },
  });
}

export function useDeleteSale(farmId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", farmId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock(farmId) });
    },
  });
}
