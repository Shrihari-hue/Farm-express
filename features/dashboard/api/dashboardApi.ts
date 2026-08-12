import { apiClient } from "@services/api/client";
import type { ActivityLog } from "@app-types/models";

/**
 * All dashboard reads live here as small, single-purpose functions rather
 * than one giant query, so each widget can load/error/refresh
 * independently (see features/dashboard/hooks/useDashboardData.ts).
 *
 * Every function still accepts `farmId` for call-site/query-key
 * compatibility, but it isn't sent on the wire — the backend scopes every
 * `/api/dashboard/*` route to `req.user.farmId` automatically.
 */

export interface WorkerCounts {
  permanent: number;
  casual: number;
}

export async function getWorkerCounts(farmId: string): Promise<WorkerCounts> {
  return apiClient.get<WorkerCounts>("/api/dashboard/worker-counts");
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  halfDay: number;
  leave: number;
  late: number;
  totalMarked: number;
}

export async function getTodayAttendanceSummary(farmId: string, date: string): Promise<AttendanceSummary> {
  return apiClient.get<AttendanceSummary>(`/api/dashboard/attendance-summary?date=${encodeURIComponent(date)}`);
}

export async function getTodaySalesTotal(farmId: string, date: string): Promise<number> {
  const { total } = await apiClient.get<{ total: number }>(
    `/api/dashboard/sales-total?date=${encodeURIComponent(date)}`,
  );
  return total;
}

export async function getTodayExpensesTotal(farmId: string, date: string): Promise<number> {
  const { total } = await apiClient.get<{ total: number }>(
    `/api/dashboard/expenses-total?date=${encodeURIComponent(date)}`,
  );
  return total;
}

export interface StockSummary {
  lowStockCount: number;
}

export async function getStockSummary(farmId: string): Promise<StockSummary> {
  return apiClient.get<StockSummary>("/api/dashboard/stock-summary");
}

export async function getRecentActivity(farmId: string, limit = 8): Promise<ActivityLog[]> {
  const { activity } = await apiClient.get<{ activity: ActivityLog[] }>(
    `/api/dashboard/recent-activity?limit=${limit}`,
  );
  return activity;
}

export interface DailyTrendPoint {
  date: string; // yyyy-MM-dd
  sales: number;
  expenses: number;
}

/** Sales vs expenses for the trailing 7 days (today inclusive), bucketed by
 * day — feeds the dashboard's Victory Native chart. */
export async function getWeeklyTrend(farmId: string, today: string): Promise<DailyTrendPoint[]> {
  const { trend } = await apiClient.get<{ trend: DailyTrendPoint[] }>(
    `/api/dashboard/weekly-trend?today=${encodeURIComponent(today)}`,
  );
  return trend;
}
