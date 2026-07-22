import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@services/query/queryClient";
import { todayISODate } from "@utils/formatters";
import {
  getRecentActivity,
  getStockSummary,
  getTodayAttendanceSummary,
  getTodayExpensesTotal,
  getTodaySalesTotal,
  getWeeklyTrend,
  getWorkerCounts,
} from "../api/dashboardApi";
import { getFarm } from "../api/farmApi";

/**
 * Fans out into one `useQuery` per widget (see queryKeys.* in
 * services/query/queryClient.ts) instead of a single mega-query, so a slow
 * or failing widget never blocks the rest of the dashboard from rendering,
 * and pull-to-refresh can refetch everything in parallel.
 */
export function useDashboardData(farmId: string) {
  const queryClient = useQueryClient();
  const date = todayISODate();

  const farm = useQuery({
    queryKey: queryKeys.farm(farmId),
    queryFn: () => getFarm(farmId),
    staleTime: 5 * 60_000,
    enabled: !!farmId,
  });

  const workerCounts = useQuery({
    queryKey: queryKeys.workerCounts(farmId),
    queryFn: () => getWorkerCounts(farmId),
    enabled: !!farmId,
  });

  const attendanceSummary = useQuery({
    queryKey: queryKeys.attendanceSummary(farmId, date),
    queryFn: () => getTodayAttendanceSummary(farmId, date),
    enabled: !!farmId,
  });

  const todaySales = useQuery({
    queryKey: queryKeys.todaySalesTotal(farmId, date),
    queryFn: () => getTodaySalesTotal(farmId, date),
    enabled: !!farmId,
  });

  const todayExpenses = useQuery({
    queryKey: queryKeys.todayExpensesTotal(farmId, date),
    queryFn: () => getTodayExpensesTotal(farmId, date),
    enabled: !!farmId,
  });

  const stockSummary = useQuery({
    queryKey: queryKeys.stockSummary(farmId),
    queryFn: () => getStockSummary(farmId),
    enabled: !!farmId,
  });

  const recentActivity = useQuery({
    queryKey: queryKeys.recentActivity(farmId),
    queryFn: () => getRecentActivity(farmId),
    enabled: !!farmId,
  });

  const weeklyTrend = useQuery({
    queryKey: queryKeys.weeklyTrend(farmId, date),
    queryFn: () => getWeeklyTrend(farmId, date),
    enabled: !!farmId,
  });

  const isRefreshing =
    farm.isFetching ||
    workerCounts.isFetching ||
    attendanceSummary.isFetching ||
    todaySales.isFetching ||
    todayExpenses.isFetching ||
    stockSummary.isFetching ||
    recentActivity.isFetching ||
    weeklyTrend.isFetching;

  const refetchAll = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.farm(farmId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.workerCounts(farmId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.attendanceSummary(farmId, date) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.todaySalesTotal(farmId, date) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.todayExpensesTotal(farmId, date) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.stockSummary(farmId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.recentActivity(farmId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.weeklyTrend(farmId, date) }),
    ]);
  }, [queryClient, farmId, date]);

  return {
    farm,
    workerCounts,
    attendanceSummary,
    todaySales,
    todayExpenses,
    stockSummary,
    recentActivity,
    weeklyTrend,
    isRefreshing,
    refetchAll,
  };
}
