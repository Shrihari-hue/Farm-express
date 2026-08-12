import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@services/query/queryClient";
import { useNetworkStatus } from "@hooks/useNetworkStatus";
import { enqueueMutation } from "@services/offline/mutationQueue";
import { deleteExpense, listExpenses, recordExpense, type RecordExpensePayload } from "../api/expensesApi";

export function useExpenses(farmId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: queryKeys.expenses(farmId, `${startDate}_${endDate}`),
    queryFn: () => listExpenses(startDate, endDate),
    enabled: !!farmId,
  });
}

/** Queued offline like attendance/sales/stock entries — see syncEngine.ts. */
export function useRecordExpense(farmId: string) {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();

  return useMutation({
    mutationFn: async (payload: RecordExpensePayload) => {
      if (!isOnline) {
        enqueueMutation("expenses", "insert", { ...payload });
        return null;
      }
      return recordExpense(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", farmId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "expenses-total", farmId] });
    },
  });
}

export function useDeleteExpense(farmId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", farmId] });
    },
  });
}
