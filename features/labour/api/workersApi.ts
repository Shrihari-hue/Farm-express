import { apiClient } from "@services/api/client";
import type { LabourType } from "@constants/config";
import type { Worker } from "@app-types/models";

export interface WorkerListFilters {
  type?: LabourType;
  search?: string;
  status?: "active" | "inactive";
}

function buildQueryString(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function listWorkers(farmId: string, filters: WorkerListFilters = {}): Promise<Worker[]> {
  const qs = buildQueryString({ type: filters.type, status: filters.status, search: filters.search });
  const { workers } = await apiClient.get<{ workers: Worker[] }>(`/api/workers${qs}`);
  return workers;
}

/** Every active worker regardless of type — used by Attendance (Step 7),
 * which marks permanent and casual workers in one list. */
export async function listActiveWorkers(farmId: string): Promise<Worker[]> {
  const { workers } = await apiClient.get<{ workers: Worker[] }>("/api/workers/active");
  return workers;
}

export async function getWorker(id: string): Promise<Worker | null> {
  try {
    const { worker } = await apiClient.get<{ worker: Worker }>(`/api/workers/${encodeURIComponent(id)}`);
    return worker;
  } catch (error) {
    if (error instanceof Error && /not found/i.test(error.message)) {
      return null;
    }
    throw error;
  }
}

export interface CreateWorkerPayload {
  farmId: string;
  type: LabourType;
  name: string;
  phone: string | null;
  address: string | null;
  village: string | null;
  joiningDate: string | null;
  monthlySalary: number | null;
  dailyWage: number | null;
  bankDetails: Worker["bankDetails"];
  notes: string | null;
}

export async function createWorker(payload: CreateWorkerPayload): Promise<Worker> {
  const { worker } = await apiClient.post<{ worker: Worker }>("/api/workers", {
    type: payload.type,
    name: payload.name,
    phone: payload.phone,
    address: payload.address,
    village: payload.village,
    joiningDate: payload.joiningDate,
    monthlySalary: payload.monthlySalary,
    dailyWage: payload.dailyWage,
    bankDetails: payload.bankDetails,
    notes: payload.notes,
  });
  return worker;
}

export type UpdateWorkerPayload = Partial<Omit<CreateWorkerPayload, "farmId" | "type">> & {
  photoUrl?: string | null;
  status?: "active" | "inactive";
};

export async function updateWorker(id: string, payload: UpdateWorkerPayload): Promise<Worker> {
  const updateBody: Record<string, unknown> = {};
  if (payload.name !== undefined) updateBody.name = payload.name;
  if (payload.phone !== undefined) updateBody.phone = payload.phone;
  if (payload.address !== undefined) updateBody.address = payload.address;
  if (payload.village !== undefined) updateBody.village = payload.village;
  if (payload.joiningDate !== undefined) updateBody.joiningDate = payload.joiningDate;
  if (payload.monthlySalary !== undefined) updateBody.monthlySalary = payload.monthlySalary;
  if (payload.dailyWage !== undefined) updateBody.dailyWage = payload.dailyWage;
  if (payload.bankDetails !== undefined) updateBody.bankDetails = payload.bankDetails;
  if (payload.notes !== undefined) updateBody.notes = payload.notes;
  if (payload.photoUrl !== undefined) updateBody.photoUrl = payload.photoUrl;
  if (payload.status !== undefined) updateBody.status = payload.status;

  const { worker } = await apiClient.patch<{ worker: Worker }>(`/api/workers/${encodeURIComponent(id)}`, updateBody);
  return worker;
}

/** Soft "remove" available to owner + supervisor — sets status to
 * inactive rather than deleting, preserving attendance/salary history. */
export async function deactivateWorker(id: string): Promise<Worker> {
  const { worker } = await apiClient.post<{ worker: Worker }>(`/api/workers/${encodeURIComponent(id)}/deactivate`);
  return worker;
}

export async function reactivateWorker(id: string): Promise<Worker> {
  const { worker } = await apiClient.post<{ worker: Worker }>(`/api/workers/${encodeURIComponent(id)}/reactivate`);
  return worker;
}

/** Hard delete — owner only (enforced both by the backend's `requireRole`
 * guard and by the UI only showing this action to owners, see
 * WorkerDetailScreen). */
export async function deleteWorker(id: string): Promise<void> {
  await apiClient.del<void>(`/api/workers/${encodeURIComponent(id)}`);
}
