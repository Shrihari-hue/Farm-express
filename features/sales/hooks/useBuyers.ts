import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@services/query/queryClient";
import { createBuyer, listBuyers, type CreateBuyerPayload } from "../api/buyersApi";

export function useBuyers(farmId: string) {
  return useQuery({
    queryKey: queryKeys.buyers(farmId),
    queryFn: () => listBuyers(),
    enabled: !!farmId,
  });
}

export function useCreateBuyer(farmId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBuyerPayload) => createBuyer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buyers(farmId) });
    },
  });
}
