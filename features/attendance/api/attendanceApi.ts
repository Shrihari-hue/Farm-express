import { apiClient } from "@services/api/client";
import type { AttendanceStatus } from "@constants/config";
import type { Attendance } from "@app-types/models";

/**
 * All attendance rows for one farm on one date. Returned as a plain array
 * (not a `Map`) deliberately — this is TanStack Query data, which
 * `PersistQueryClientProvider` serializes to AsyncStorage via `JSON.stringify`
 * for offline viewing, and `Map`/`Set` don't survive that round trip. Callers
 * that want O(1) lookup build their own `Map` locally (see `useAttendance`).
 *
 * `farmId` is accepted for call-site/query-key compatibility but isn't sent
 * on the wire — the backend scopes every request to `req.user.farmId`
 * (the JWT's own farm) automatically.
 */
export async function getAttendanceForDate(farmId: string, date: string): Promise<Attendance[]> {
  const { attendance } = await apiClient.get<{ attendance: Attendance[] }>(
    `/api/attendance?date=${encodeURIComponent(date)}`,
  );
  return attendance;
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

/** One row per worker per day — the backend upserts on the `(workerId,
 * date)` unique index, so marking the same worker twice for a day corrects
 * the earlier entry instead of erroring or duplicating. */
export async function markAttendance(payload: MarkAttendancePayload): Promise<Attendance> {
  const { attendance } = await apiClient.put<{ attendance: Attendance }>("/api/attendance", {
    workerId: payload.workerId,
    date: payload.date,
    status: payload.status,
    todaysWage: payload.todaysWage,
    workDone: payload.workDone,
    remarks: payload.remarks,
    markedBy: payload.markedBy,
  });
  return attendance;
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
  await apiClient.put<void>("/api/attendance/bulk", {
    date: params.date,
    workerIds: params.workerIds,
    markedBy: params.markedBy,
  });
}

/** Every attendance row for one worker within a date range — feeds both
 * the worker detail screen's monthly summary and any future "attendance
 * history" list. */
export async function getWorkerAttendanceInRange(
  workerId: string,
  startDate: string,
  endDate: string,
): Promise<Attendance[]> {
  const { attendance } = await apiClient.get<{ attendance: Attendance[] }>(
    `/api/attendance/worker/${encodeURIComponent(workerId)}?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
  );
  return attendance;
}

export interface DayOverview {
  date: string;
  markedCount: number;
  presentCount: number;
}

/** One entry per day-with-attendance in a month, for the History calendar's
 * dot markers — computed server-side via a Mongo aggregation pipeline.
 * Returned as an array (see `getAttendanceForDate` for why — offline
 * persistence + `Map` don't mix); `useMonthAttendanceOverview` turns this
 * into a `Map` for the calendar. */
export async function getMonthAttendanceOverview(
  farmId: string,
  monthStart: string,
  monthEnd: string,
): Promise<DayOverview[]> {
  const { overview } = await apiClient.get<{ overview: DayOverview[] }>(
    `/api/attendance/overview?monthStart=${encodeURIComponent(monthStart)}&monthEnd=${encodeURIComponent(monthEnd)}`,
  );
  return overview;
}
