import type {
  AttendanceStatus,
  ExpenseCategory,
  LabourType,
  PaymentMethod,
  Role,
  StockCategory,
} from "@constants/config";

/**
 * Domain models shared across features. These mirror the Postgres schema
 * (see `database/schema.sql`) but stay hand-written so the app layer isn't
 * coupled 1:1 to codegen output — `services/supabase/database.types.ts`
 * holds the raw generated types instead.
 */

export interface Farm {
  id: string;
  name: string;
  ownerId: string;
  location: string | null;
  phone: string | null;
  currency: string;
  language: string;
  createdAt: string;
}

export interface AppUser {
  id: string;
  /** Null until the "complete profile" step runs — see `needsProfileCompletion`
   * in `services/state/authStore.ts`. */
  farmId: string | null;
  fullName: string;
  role: Role;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface BankDetails {
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
  bankName?: string;
  branch?: string;
}

export interface Worker {
  id: string;
  farmId: string;
  type: LabourType;
  name: string;
  photoUrl: string | null;
  phone: string | null;
  address: string | null;
  village: string | null;
  joiningDate: string | null;
  monthlySalary: number | null;
  dailyWage: number | null;
  bankDetails: BankDetails | null;
  status: "active" | "inactive";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  farmId: string;
  workerId: string;
  date: string; // ISO date (yyyy-MM-dd)
  status: AttendanceStatus;
  todaysWage: number | null; // casual labour only
  workDone: string | null;
  remarks: string | null;
  markedBy: string;
  createdAt: string;
}

export interface SalaryAdvance {
  id: string;
  farmId: string;
  workerId: string;
  date: string;
  amount: number;
  reason: string | null;
  remainingBalance: number;
  createdAt: string;
}

export interface SalaryPayment {
  id: string;
  farmId: string;
  workerId: string;
  periodStart: string;
  periodEnd: string;
  workingDays: number;
  leaves: number;
  halfDays: number;
  advanceDeducted: number;
  bonuses: number;
  deductions: number;
  grossAmount: number;
  netAmount: number;
  status: "pending" | "paid";
  paidAt: string | null;
  createdAt: string;
}

export interface StockItem {
  id: string;
  farmId: string;
  category: StockCategory;
  name: string;
  unit: string;
  quantity: number;
  location: string | null;
  lowStockThreshold: number | null;
  addedBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockHistoryEntry {
  id: string;
  farmId: string;
  stockItemId: string;
  date: string;
  openingQuantity: number;
  harvestedToday: number;
  soldToday: number;
  damaged: number;
  remainingStock: number;
  notes: string | null;
  recordedBy: string;
  createdAt: string;
}

export interface Buyer {
  id: string;
  farmId: string;
  name: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

export interface Sale {
  id: string;
  farmId: string;
  stockItemId: string;
  buyerId: string;
  quantity: number;
  rate: number;
  amount: number;
  transportCost: number;
  commission: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  date: string;
  remarks: string | null;
  recordedBy: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  farmId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  billImageUrl: string | null;
  notes: string | null;
  recordedBy: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  farmId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  farmId: string;
  userId: string | null;
  title: string;
  body: string;
  type: "attendance" | "stock" | "salary" | "payment" | "low_stock" | "general";
  isRead: boolean;
  createdAt: string;
}
