import { subDays, format } from "date-fns";
import { supabase } from "@services/supabase/client";
import type { ActivityLog } from "@types/models";

/**
 * All dashboard reads live here as small, single-purpose functions rather
 * than one giant query, so each widget can load/error/refresh
 * independently (see features/dashboard/hooks/useDashboardData.ts).
 *
 * None of these use a Postgres aggregate/RPC — a single farm's daily row
 * counts are small enough that fetching the raw rows and summing in JS is
 * simpler to read and just as fast, and it keeps every dashboard number
 * explainable from plain `select` statements during development.
 */

export interface WorkerCounts {
  permanent: number;
  casual: number;
}

export async function getWorkerCounts(farmId: string): Promise<WorkerCounts> {
  const [permanent, casual] = await Promise.all([
    supabase
      .from("workers")
      .select("id", { count: "exact", head: true })
      .eq("farm_id", farmId)
      .eq("type", "permanent")
      .eq("status", "active"),
    supabase
      .from("workers")
      .select("id", { count: "exact", head: true })
      .eq("farm_id", farmId)
      .eq("type", "casual")
      .eq("status", "active"),
  ]);

  if (permanent.error) throw permanent.error;
  if (casual.error) throw casual.error;

  return { permanent: permanent.count ?? 0, casual: casual.count ?? 0 };
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  halfDay: number;
  leave: number;
  late: number;
  totalMarked: number;
}

const EMPTY_ATTENDANCE_SUMMARY: AttendanceSummary = {
  present: 0,
  absent: 0,
  halfDay: 0,
  leave: 0,
  late: 0,
  totalMarked: 0,
};

export async function getTodayAttendanceSummary(farmId: string, date: string): Promise<AttendanceSummary> {
  const { data, error } = await supabase
    .from("attendance")
    .select("status")
    .eq("farm_id", farmId)
    .eq("date", date);

  if (error) throw error;
  if (!data || data.length === 0) return EMPTY_ATTENDANCE_SUMMARY;

  return data.reduce(
    (summary, row) => {
      summary.totalMarked += 1;
      if (row.status === "present") summary.present += 1;
      else if (row.status === "absent") summary.absent += 1;
      else if (row.status === "half_day") summary.halfDay += 1;
      else if (row.status === "leave") summary.leave += 1;
      else if (row.status === "late") summary.late += 1;
      return summary;
    },
    { ...EMPTY_ATTENDANCE_SUMMARY },
  );
}

export async function getTodaySalesTotal(farmId: string, date: string): Promise<number> {
  const { data, error } = await supabase
    .from("sales")
    .select("net_amount")
    .eq("farm_id", farmId)
    .eq("date", date);

  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + Number(row.net_amount), 0);
}

export async function getTodayExpensesTotal(farmId: string, date: string): Promise<number> {
  const { data, error } = await supabase
    .from("expenses")
    .select("amount")
    .eq("farm_id", farmId)
    .eq("date", date);

  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

export interface StockSummary {
  totalItems: number;
  lowStockCount: number;
}

export async function getStockSummary(farmId: string): Promise<StockSummary> {
  const { data, error } = await supabase
    .from("stock")
    .select("quantity, low_stock_threshold")
    .eq("farm_id", farmId);

  if (error) throw error;
  const rows = data ?? [];
  const lowStockCount = rows.filter(
    (row) => row.low_stock_threshold !== null && Number(row.quantity) <= Number(row.low_stock_threshold),
  ).length;

  return { totalItems: rows.length, lowStockCount };
}

export async function getRecentActivity(farmId: string, limit = 8): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("farm_id", farmId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    farmId: row.farm_id,
    userId: row.user_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.created_at,
  }));
}

export interface DailyTrendPoint {
  date: string; // yyyy-MM-dd
  sales: number;
  expenses: number;
}

/** Sales vs expenses for the trailing 7 days (today inclusive), bucketed by
 * day — feeds the dashboard's Victory Native chart. */
export async function getWeeklyTrend(farmId: string, today: string): Promise<DailyTrendPoint[]> {
  const startDate = format(subDays(new Date(today), 6), "yyyy-MM-dd");

  const [salesResult, expensesResult] = await Promise.all([
    supabase
      .from("sales")
      .select("date, net_amount")
      .eq("farm_id", farmId)
      .gte("date", startDate)
      .lte("date", today),
    supabase
      .from("expenses")
      .select("date, amount")
      .eq("farm_id", farmId)
      .gte("date", startDate)
      .lte("date", today),
  ]);

  if (salesResult.error) throw salesResult.error;
  if (expensesResult.error) throw expensesResult.error;

  const byDate = new Map<string, DailyTrendPoint>();
  for (let i = 0; i < 7; i += 1) {
    const date = format(subDays(new Date(today), 6 - i), "yyyy-MM-dd");
    byDate.set(date, { date, sales: 0, expenses: 0 });
  }

  for (const row of salesResult.data ?? []) {
    const point = byDate.get(row.date);
    if (point) point.sales += Number(row.net_amount);
  }
  for (const row of expensesResult.data ?? []) {
    const point = byDate.get(row.date);
    if (point) point.expenses += Number(row.amount);
  }

  return Array.from(byDate.values());
}
