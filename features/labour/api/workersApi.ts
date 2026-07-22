import { supabase } from "@services/supabase/client";
import type { Database } from "@services/supabase/database.types";
import type { LabourType } from "@constants/config";
import type { Worker } from "@types/models";

type WorkerRow = Database["public"]["Tables"]["workers"]["Row"];
type WorkerInsert = Database["public"]["Tables"]["workers"]["Insert"];
type WorkerUpdate = Database["public"]["Tables"]["workers"]["Update"];

function mapRow(row: WorkerRow): Worker {
  return {
    id: row.id,
    farmId: row.farm_id,
    type: row.type,
    name: row.name,
    photoUrl: row.photo_url,
    phone: row.phone,
    address: row.address,
    village: row.village,
    joiningDate: row.joining_date,
    monthlySalary: row.monthly_salary,
    dailyWage: row.daily_wage,
    bankDetails: (row.bank_details as Worker["bankDetails"]) ?? null,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface WorkerListFilters {
  type?: LabourType;
  search?: string;
  status?: "active" | "inactive";
}

export async function listWorkers(farmId: string, filters: WorkerListFilters = {}): Promise<Worker[]> {
  let query = supabase.from("workers").select("*").eq("farm_id", farmId);

  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.order("status", { ascending: true }).order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/** Every active worker regardless of type — used by Attendance (Step 7),
 * which marks permanent and casual workers in one list. */
export async function listActiveWorkers(farmId: string): Promise<Worker[]> {
  return listWorkers(farmId, { status: "active" });
}

export async function getWorker(id: string): Promise<Worker | null> {
  const { data, error } = await supabase.from("workers").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
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
  const insertRow: WorkerInsert = {
    farm_id: payload.farmId,
    type: payload.type,
    name: payload.name,
    phone: payload.phone,
    address: payload.address,
    village: payload.village,
    joining_date: payload.joiningDate,
    monthly_salary: payload.monthlySalary,
    daily_wage: payload.dailyWage,
    bank_details: payload.bankDetails,
    notes: payload.notes,
  };

  const { data, error } = await supabase.from("workers").insert(insertRow).select("*").single();
  if (error) throw error;
  return mapRow(data);
}

export type UpdateWorkerPayload = Partial<Omit<CreateWorkerPayload, "farmId" | "type">> & {
  photoUrl?: string | null;
  status?: "active" | "inactive";
};

export async function updateWorker(id: string, payload: UpdateWorkerPayload): Promise<Worker> {
  const updateRow: WorkerUpdate = {};
  if (payload.name !== undefined) updateRow.name = payload.name;
  if (payload.phone !== undefined) updateRow.phone = payload.phone;
  if (payload.address !== undefined) updateRow.address = payload.address;
  if (payload.village !== undefined) updateRow.village = payload.village;
  if (payload.joiningDate !== undefined) updateRow.joining_date = payload.joiningDate;
  if (payload.monthlySalary !== undefined) updateRow.monthly_salary = payload.monthlySalary;
  if (payload.dailyWage !== undefined) updateRow.daily_wage = payload.dailyWage;
  if (payload.bankDetails !== undefined) updateRow.bank_details = payload.bankDetails;
  if (payload.notes !== undefined) updateRow.notes = payload.notes;
  if (payload.photoUrl !== undefined) updateRow.photo_url = payload.photoUrl;
  if (payload.status !== undefined) updateRow.status = payload.status;

  const { data, error } = await supabase.from("workers").update(updateRow).eq("id", id).select("*").single();
  if (error) throw error;
  return mapRow(data);
}

/** Soft "remove" available to owner + supervisor — sets status to
 * inactive rather than deleting, preserving attendance/salary history. */
export async function deactivateWorker(id: string): Promise<Worker> {
  return updateWorker(id, { status: "inactive" });
}

export async function reactivateWorker(id: string): Promise<Worker> {
  return updateWorker(id, { status: "active" });
}

/** Hard delete — owner only (enforced both by RLS and by the UI only
 * showing this action to owners, see WorkerDetailScreen). */
export async function deleteWorker(id: string): Promise<void> {
  const { error } = await supabase.from("workers").delete().eq("id", id);
  if (error) throw error;
}
