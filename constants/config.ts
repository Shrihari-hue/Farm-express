/**
 * Application-wide constants.
 * Centralising these avoids "magic strings" scattered across features
 * and makes role/permission changes a one-file edit.
 */

export const APP_NAME = "Farm Express";

export const ENV = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000",
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? "development",
} as const;

/** India-only for v1 — matches the 10-digit phone validation in
 * `utils/validation.ts`. Used for displaying/entering worker phone numbers
 * (not auth — login is email+password only). Revisit if the app expands
 * beyond India. */
export const PHONE_COUNTRY_CODE = "+91";

/** The three roles supported across the whole app. Kept in one place so
 * permission checks never rely on ad-hoc string comparisons. */
export const ROLES = {
  OWNER: "owner",
  SUPERVISOR: "supervisor",
  LABOUR: "labour",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const LABOUR_TYPES = {
  PERMANENT: "permanent",
  CASUAL: "casual",
} as const;

export type LabourType = (typeof LABOUR_TYPES)[keyof typeof LABOUR_TYPES];

export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  HALF_DAY: "half_day",
  LEAVE: "leave",
  LATE: "late",
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export const PAYMENT_METHODS = {
  CASH: "cash",
  UPI: "upi",
  BANK: "bank",
  CREDIT: "credit",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const STOCK_CATEGORIES = {
  COCONUT_BAGS: "coconut_bags",
  ARECANUT_BAGS: "arecanut_bags",
  PEPPER: "pepper",
  BANANA: "banana",
  COFFEE: "coffee",
  MANGO: "mango",
  CUSTOM: "custom",
} as const;

export type StockCategory = (typeof STOCK_CATEGORIES)[keyof typeof STOCK_CATEGORIES];

export const EXPENSE_CATEGORIES = {
  FERTILIZER: "fertilizer",
  FUEL: "fuel",
  PESTICIDES: "pesticides",
  SEEDS: "seeds",
  ELECTRICITY: "electricity",
  WATER: "water",
  MAINTENANCE: "maintenance",
  MACHINE_REPAIR: "machine_repair",
  TRANSPORT: "transport",
  MISCELLANEOUS: "miscellaneous",
} as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[keyof typeof EXPENSE_CATEGORIES];

/** Simple, explicit permission matrix used by `utils/permissions.ts`. */
export const PERMISSIONS = {
  // Labour has the same day-to-day recording access as supervisor (record
  // sales, expenses, stock movements, attendance) — only worker/payroll
  // management and account settings stay owner+supervisor / owner-only.
  MANAGE_WORKERS: [ROLES.OWNER, ROLES.SUPERVISOR],
  DELETE_RECORDS: [ROLES.OWNER],
  ENTER_ATTENDANCE: [ROLES.OWNER, ROLES.SUPERVISOR, ROLES.LABOUR],
  UPDATE_STOCK: [ROLES.OWNER, ROLES.SUPERVISOR, ROLES.LABOUR],
  MANAGE_SALES: [ROLES.OWNER, ROLES.SUPERVISOR, ROLES.LABOUR],
  MANAGE_EXPENSES: [ROLES.OWNER, ROLES.SUPERVISOR, ROLES.LABOUR],
  VIEW_REPORTS: [ROLES.OWNER, ROLES.SUPERVISOR],
  MANAGE_SETTINGS: [ROLES.OWNER],
} as const;

export const DEFAULT_CURRENCY = "INR";
export const DEFAULT_LOCALE = "en-IN";

export const QUERY_STALE_TIME_MS = 60_000;
export const OFFLINE_SYNC_INTERVAL_MS = 15_000;
