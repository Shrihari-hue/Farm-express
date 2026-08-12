import { QueryClient } from "@tanstack/react-query";
import { QUERY_STALE_TIME_MS } from "@constants/config";

/**
 * One QueryClient for the whole app. `networkMode: "offlineFirst"` means a
 * query with cached data renders immediately even with no connection, and
 * retries transparently once `NetworkStatus` (see `hooks/useNetworkStatus`)
 * reports the device is back online.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME_MS,
      gcTime: 24 * 60 * 60 * 1000, // 24h — keep cache around for offline viewing
      networkMode: "offlineFirst",
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});

export const queryKeys = {
  workers: (farmId: string, type?: string) => ["workers", farmId, type] as const,
  activeWorkers: (farmId: string) => ["workers", farmId, "active-all"] as const,
  worker: (workerId: string) => ["worker", workerId] as const,
  attendance: (farmId: string, date: string) => ["attendance", farmId, date] as const,
  attendanceHistory: (workerId: string, month: string) =>
    ["attendance-history", workerId, month] as const,
  attendanceMonthOverview: (farmId: string, month: string) =>
    ["attendance-month-overview", farmId, month] as const,
  salaryPayments: (farmId: string, month: string) => ["salary-payments", farmId, month] as const,
  advances: (workerId: string) => ["advances", workerId] as const,
  stock: (farmId: string) => ["stock", farmId] as const,
  stockItem: (stockItemId: string) => ["stock-item", stockItemId] as const,
  stockHistory: (stockItemId: string) => ["stock-history", stockItemId] as const,
  sales: (farmId: string, range: string) => ["sales", farmId, range] as const,
  expenses: (farmId: string, range: string) => ["expenses", farmId, range] as const,
  buyers: (farmId: string) => ["buyers", farmId] as const,
  dashboard: (farmId: string, date: string) => ["dashboard", farmId, date] as const,
  notifications: (userId: string) => ["notifications", userId] as const,

  // Dashboard (Step 5) widgets — split per-widget so one slow query never
  // blocks the rest of the screen from rendering, and pull-to-refresh can
  // invalidate just this farm's dashboard data.
  workerCounts: (farmId: string) => ["dashboard", "worker-counts", farmId] as const,
  attendanceSummary: (farmId: string, date: string) =>
    ["dashboard", "attendance-summary", farmId, date] as const,
  todaySalesTotal: (farmId: string, date: string) =>
    ["dashboard", "sales-total", farmId, date] as const,
  todayExpensesTotal: (farmId: string, date: string) =>
    ["dashboard", "expenses-total", farmId, date] as const,
  stockSummary: (farmId: string) => ["dashboard", "stock-summary", farmId] as const,
  recentActivity: (farmId: string) => ["dashboard", "recent-activity", farmId] as const,
  weeklyTrend: (farmId: string, weekStart: string) =>
    ["dashboard", "weekly-trend", farmId, weekStart] as const,
  farm: (farmId: string) => ["farm", farmId] as const,
};
