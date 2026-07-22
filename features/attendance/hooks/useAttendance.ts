import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@services/query/queryClient";
import { useNetworkStatus } from "@hooks/useNetworkStatus";
import { enqueueMutation } from "@services/offline/mutationQueue";
import { listActiveWorkers } from "@features/labour/api/workersApi";
import type { AttendanceStatus } from "@constants/config";
import type { Attendance } from "@types/models";
import {
  getAttendanceForDate,
  getMonthAttendanceOverview,
  getWorkerAttendanceInRange,
  markAllPresent,
  markAttendance,
  type MarkAttendancePayload,
} from "../api/attendanceApi";

export function useActiveWorkers(farmId: string) {
  return useQuery({
    queryKey: queryKeys.activeWorkers(farmId),
    queryFn: () => listActiveWorkers(farmId),
    enabled: !!farmId,
  });
}

/** Attendance rows for one date, plus a `Map` view (built in-hook, never
 * stored in the cache — see attendanceApi.ts) for O(1) lookup by worker. */
export function useAttendanceForDate(farmId: string, date: string) {
  const query = useQuery({
    queryKey: queryKeys.attendance(farmId, date),
    queryFn: () => getAttendanceForDate(farmId, date),
    enabled: !!farmId,
  });

  const byWorkerId = useMemo(() => {
    const map = new Map<string, Attendance>();
    for (const row of query.data ?? []) map.set(row.workerId, row);
    return map;
  }, [query.data]);

  return { ...query, byWorkerId };
}

/**
 * Marks one worker's attendance for one day. Optimistically patches the
 * `useAttendanceForDate` cache so tapping a status pill feels instant, then
 * either writes through to Supabase (online) or queues it in the local
 * outbox (offline) — mirroring the pattern in `useSetWorkerStatus`.
 */
export function useMarkAttendance(farmId: string, date: string) {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();
  const queryKey = queryKeys.attendance(farmId, date);

  return useMutation({
    mutationFn: async (payload: MarkAttendancePayload) => {
      if (!isOnline) {
        // syncEngine.replayOne() does a raw `supabase.from(table).upsert(payload)`
        // with no field mapping, so the queued payload must already use the
        // table's snake_case column names — not the camelCase domain shape.
        enqueueMutation("attendance", "insert", {
          farm_id: payload.farmId,
          worker_id: payload.workerId,
          date: payload.date,
          status: payload.status,
          todays_wage: payload.todaysWage,
          work_done: payload.workDone,
          remarks: payload.remarks,
          marked_by: payload.markedBy,
        });
        return null;
      }
      return markAttendance(payload);
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Attendance[]>(queryKey);

      const optimisticRow: Attendance = {
        id: previous?.find((row) => row.workerId === payload.workerId)?.id ?? `optimistic-${payload.workerId}`,
        farmId: payload.farmId,
        workerId: payload.workerId,
        date: payload.date,
        status: payload.status,
        todaysWage: payload.todaysWage,
        workDone: payload.workDone,
        remarks: payload.remarks,
        markedBy: payload.markedBy,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Attendance[]>(queryKey, (current) => {
        const rest = (current ?? []).filter((row) => row.workerId !== payload.workerId);
        return [...rest, optimisticRow];
      });

      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendanceSummary(farmId, date) });
    },
  });
}

export function useMarkAllPresent(farmId: string, date: string) {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();

  return useMutation({
    mutationFn: async (params: { workerIds: string[]; markedBy: string }) => {
      if (!isOnline) {
        for (const workerId of params.workerIds) {
          enqueueMutation("attendance", "insert", {
            farm_id: farmId,
            worker_id: workerId,
            date,
            status: "present",
            todays_wage: null,
            work_done: null,
            remarks: null,
            marked_by: params.markedBy,
          });
        }
        return;
      }
      await markAllPresent({ farmId, date, workerIds: params.workerIds, markedBy: params.markedBy });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance(farmId, date) });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendanceSummary(farmId, date) });
    },
  });
}

/** This-month attendance summary for one worker — feeds the "Attendance"
 * card on the worker detail screen (Step 6). */
export function useWorkerAttendanceSummary(workerId: string | undefined, monthStart: string, monthEnd: string) {
  const query = useQuery({
    queryKey: queryKeys.attendanceHistory(workerId ?? "", monthStart),
    queryFn: () => getWorkerAttendanceInRange(workerId as string, monthStart, monthEnd),
    enabled: !!workerId,
  });

  const summary = useMemo(() => {
    const counts = { present: 0, absent: 0, halfDay: 0, leave: 0, late: 0 };
    for (const row of query.data ?? []) {
      if (row.status === "present") counts.present += 1;
      else if (row.status === "absent") counts.absent += 1;
      else if (row.status === "half_day") counts.halfDay += 1;
      else if (row.status === "leave") counts.leave += 1;
      else if (row.status === "late") counts.late += 1;
    }
    return counts;
  }, [query.data]);

  return { ...query, summary };
}

/** Marked-day overview for a month, as a `Map<date, DayOverview>` for the
 * History calendar's dot markers. */
export function useMonthAttendanceOverview(farmId: string, monthStart: string, monthEnd: string) {
  const query = useQuery({
    queryKey: queryKeys.attendanceMonthOverview(farmId, monthStart),
    queryFn: () => getMonthAttendanceOverview(farmId, monthStart, monthEnd),
    enabled: !!farmId,
  });

  const byDate = useMemo(() => {
    const map = new Map<string, { date: string; markedCount: number; presentCount: number }>();
    for (const entry of query.data ?? []) map.set(entry.date, entry);
    return map;
  }, [query.data]);

  return { ...query, byDate };
}

export type { AttendanceStatus };
