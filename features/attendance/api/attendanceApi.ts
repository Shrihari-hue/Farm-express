import { supabase } from "@services/supabase/client";
import type { Database } from "@services/supabase/database.types";
import type { AttendanceStatus } from "@constants/config";
import type { Attendance } from "@types/models";

type AttendanceRow = Database["public"]["Tables"]["attendance"]["Row"];

function mapRow(row: AttendanceRow): Attendance {
  return {
    id: row.id,
    farmId: row.farm_id,
    workerId: row.worker_id,
    date: row.date,
    status: row.status,
    todaysWage: row.todays_wage,
    workDone: row.work_done,
    remarks: row.remarks,
    markedBy: row.marked_by,
    createdAt: row.created_at,
  };
}

/**
 * All attendance rows for one farm on one date. Returned as a plain array
 * (not a `Map`) deliberately — this is TanStack Query data, which
 * `PersistQueryClientProvider` serializes to MMKV via `JSON.stringify` for
 * offline viewing, and `Map`/`Set` don't survive that round trip. Callers
 * that want O(1) lookup build their own `Map` locally (see `useAttendance`).
 */
export async function getAttendanceForDate(farmId: string, date: string): Promise<Attendance[]> {
  const { data, error } = await supabase.from("attendance").select("*").eq("farm_id", farmId).eq("date", date);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export interface MarkAttendancePayload {
  farmId: string;
  workerId: string;
  date: string;
  status: AttendanceStatus;
  todaysWage: number | null;
  workDone: string | null;
  remarks: string | null;
  markedBy: string;
}

/** One row per worker per day — `upsert` on the `(worker_id, date)` unique
 * constraint means marking the same worker twice for a day corrects the
 * earlier entry instead of erroring or duplicating. */
export async function markAttendance(payload: MarkAttendancePayload): Promise<Attendance> {
  const { data, error } = await supabase
    .from("attendance")
    .upsert(
      {
        farm_id: payload.farmId,
        worker_id: payload.workerId,
        date: payload.date,
        status: payload.status,
        todays_wage: payload.todaysWage,
        work_done: payload.workDone,
        remarks: payload.remarks,
        marked_by: payload.markedBy,
      },
      { onConflict: "worker_id,date" },
    )
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data);
}

/** Marks every given worker "present" in a single round trip — backs the
 * "Mark all present" quick action. */
export async function markAllPresent(params: {
  farmId: string;
  date: string;
  workerIds: string[];
  markedBy: string;
}): Promise<void> {
  if (params.workerIds.length === 0) return;
  const rows = params.workerIds.map((workerId) => ({
    farm_id: params.farmId,
    worker_id: workerId,
    date: params.date,
    status: "present" as const,
    todays_wage: null,
    work_done: null,
    remarks: null,
    marked_by: params.markedBy,
  }));

  const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "worker_id,date" });
  if (error) throw error;
}

/** Every attendance row for one worker within a date range — feeds both
 * the worker detail screen's monthly summary and any future "attendance
 * history" list. */
export async function getWorkerAttendanceInRange(
  workerId: string,
  startDate: string,
  endDate: string,
): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("worker_id", workerId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export interface DayOverview {
  date: string;
  markedCount: number;
  presentCount: number;
}

/** One entry per day-with-attendance in a month, for the History calendar's
 * dot markers — computed client-side from the raw rows since a farm's
 * monthly attendance volume (workers × ~30) is small. Returned as an array
 * (see `getAttendanceForDate` for why — MMKV persistence + `Map` don't mix);
 * `useMonthAttendanceOverview` turns this into a `Map` for the calendar. */
export async function getMonthAttendanceOverview(
  farmId: string,
  monthStart: string,
  monthEnd: string,
): Promise<DayOverview[]> {
  const { data, error } = await supabase
    .from("attendance")
    .select("date, status")
    .eq("farm_id", farmId)
    .gte("date", monthStart)
    .lte("date", monthEnd);

  if (error) throw error;

  const byDate = new Map<string, DayOverview>();
  for (const row of data ?? []) {
    const existing = byDate.get(row.date) ?? { date: row.date, markedCount: 0, presentCount: 0 };
    existing.markedCount += 1;
    if (row.status === "present") existing.presentCount += 1;
    byDate.set(row.date, existing);
  }
  return Array.from(byDate.values());
}
