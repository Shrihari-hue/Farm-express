/**
 * Hand-written mirror of `database/schema.sql` (Step 4).
 *
 * Once the schema is applied to a real Supabase project, prefer replacing
 * this with the real generated file for perfect accuracy:
 *
 *   npx supabase gen types typescript --project-id <project-id> > services/supabase/database.types.ts
 *
 * Kept hand-written for now so the app compiles against the actual schema
 * without requiring a live project during development. Every table follows
 * the same `Row / Insert / Update` shape supabase-js expects.
 */

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Role = "owner" | "supervisor" | "labour";
export type LabourType = "permanent" | "casual";
export type AttendanceStatusDb = "present" | "absent" | "half_day" | "leave" | "late";
export type PaymentMethodDb = "cash" | "upi" | "bank" | "credit";
export type StockCategoryDb =
  | "coconut_bags"
  | "arecanut_bags"
  | "pepper"
  | "banana"
  | "coffee"
  | "mango"
  | "custom";
export type ExpenseCategoryDb =
  | "fertilizer"
  | "fuel"
  | "pesticides"
  | "seeds"
  | "electricity"
  | "water"
  | "maintenance"
  | "machine_repair"
  | "transport"
  | "miscellaneous";
export type NotificationType = "attendance" | "stock" | "salary" | "payment" | "low_stock" | "general";

interface Table<Row, Insert, Update> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      roles: Table<
        { id: string; label: string },
        { id: string; label: string },
        { id?: string; label?: string }
      >;
      farms: Table<
        {
          id: string;
          name: string;
          owner_id: string;
          location: string | null;
          phone: string | null;
          currency: string;
          language: string;
          created_at: string;
        },
        {
          id?: string;
          name: string;
          owner_id: string;
          location?: string | null;
          phone?: string | null;
          currency?: string;
          language?: string;
          created_at?: string;
        },
        Partial<{
          name: string;
          location: string | null;
          phone: string | null;
          currency: string;
          language: string;
        }>
      >;
      users: Table<
        {
          id: string;
          farm_id: string | null;
          full_name: string;
          role: Role;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
        },
        {
          id: string;
          farm_id?: string | null;
          full_name?: string;
          role?: Role;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        },
        Partial<{
          farm_id: string | null;
          full_name: string;
          role: Role;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
        }>
      >;
      workers: Table<
        {
          id: string;
          farm_id: string;
          user_id: string | null;
          type: LabourType;
          name: string;
          photo_url: string | null;
          phone: string | null;
          address: string | null;
          village: string | null;
          joining_date: string | null;
          monthly_salary: number | null;
          daily_wage: number | null;
          bank_details: Json | null;
          status: "active" | "inactive";
          notes: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          farm_id: string;
          user_id?: string | null;
          type: LabourType;
          name: string;
          photo_url?: string | null;
          phone?: string | null;
          address?: string | null;
          village?: string | null;
          joining_date?: string | null;
          monthly_salary?: number | null;
          daily_wage?: number | null;
          bank_details?: Json | null;
          status?: "active" | "inactive";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<{
          user_id: string | null;
          type: LabourType;
          name: string;
          photo_url: string | null;
          phone: string | null;
          address: string | null;
          village: string | null;
          joining_date: string | null;
          monthly_salary: number | null;
          daily_wage: number | null;
          bank_details: Json | null;
          status: "active" | "inactive";
          notes: string | null;
        }>
      >;
      attendance: Table<
        {
          id: string;
          farm_id: string;
          worker_id: string;
          date: string;
          status: AttendanceStatusDb;
          todays_wage: number | null;
          work_done: string | null;
          remarks: string | null;
          marked_by: string;
          created_at: string;
        },
        {
          id?: string;
          farm_id: string;
          worker_id: string;
          date: string;
          status: AttendanceStatusDb;
          todays_wage?: number | null;
          work_done?: string | null;
          remarks?: string | null;
          marked_by: string;
          created_at?: string;
        },
        Partial<{
          status: AttendanceStatusDb;
          todays_wage: number | null;
          work_done: string | null;
          remarks: string | null;
        }>
      >;
      salary_advances: Table<
        {
          id: string;
          farm_id: string;
          worker_id: string;
          date: string;
          amount: number;
          reason: string | null;
          remaining_balance: number;
          created_at: string;
        },
        {
          id?: string;
          farm_id: string;
          worker_id: string;
          date?: string;
          amount: number;
          reason?: string | null;
          remaining_balance: number;
          created_at?: string;
        },
        Partial<{ reason: string | null; remaining_balance: number }>
      >;
      salary_payments: Table<
        {
          id: string;
          farm_id: string;
          worker_id: string;
          period_start: string;
          period_end: string;
          working_days: number;
          leaves: number;
          half_days: number;
          advance_deducted: number;
          bonuses: number;
          deductions: number;
          gross_amount: number;
          net_amount: number;
          status: "pending" | "paid";
          paid_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          farm_id: string;
          worker_id: string;
          period_start: string;
          period_end: string;
          working_days?: number;
          leaves?: number;
          half_days?: number;
          advance_deducted?: number;
          bonuses?: number;
          deductions?: number;
          gross_amount: number;
          net_amount: number;
          status?: "pending" | "paid";
          paid_at?: string | null;
          created_at?: string;
        },
        Partial<{ status: "pending" | "paid"; paid_at: string | null }>
      >;
      stock: Table<
        {
          id: string;
          farm_id: string;
          category: StockCategoryDb;
          name: string;
          unit: string;
          quantity: number;
          location: string | null;
          low_stock_threshold: number | null;
          added_by: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          farm_id: string;
          category: StockCategoryDb;
          name: string;
          unit: string;
          quantity?: number;
          location?: string | null;
          low_stock_threshold?: number | null;
          added_by: string;
          updated_by: string;
          created_at?: string;
          updated_at?: string;
        },
        Partial<{
          category: StockCategoryDb;
          name: string;
          unit: string;
          quantity: number;
          location: string | null;
          low_stock_threshold: number | null;
          updated_by: string;
        }>
      >;
      stock_history: Table<
        {
          id: string;
          farm_id: string;
          stock_item_id: string;
          date: string;
          opening_quantity: number;
          harvested_today: number;
          sold_today: number;
          damaged: number;
          remaining_stock: number;
          notes: string | null;
          recorded_by: string;
          created_at: string;
        },
        {
          id?: string;
          farm_id: string;
          stock_item_id: string;
          date?: string;
          opening_quantity?: number;
          harvested_today?: number;
          sold_today?: number;
          damaged?: number;
          remaining_stock?: number;
          notes?: string | null;
          recorded_by: string;
          created_at?: string;
        },
        // Intentionally no updatable fields — append-only per policies.sql.
        Record<string, never>
      >;
      buyers: Table<
        { id: string; farm_id: string; name: string; phone: string | null; address: string | null; created_at: string },
        {
          id?: string;
          farm_id: string;
          name: string;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
        },
        Partial<{ name: string; phone: string | null; address: string | null }>
      >;
      sales: Table<
        {
          id: string;
          farm_id: string;
          stock_item_id: string;
          buyer_id: string;
          quantity: number;
          rate: number;
          amount: number;
          transport_cost: number;
          commission: number;
          net_amount: number;
          payment_method: PaymentMethodDb;
          date: string;
          remarks: string | null;
          recorded_by: string;
          created_at: string;
        },
        {
          id?: string;
          farm_id: string;
          stock_item_id: string;
          buyer_id: string;
          quantity: number;
          rate: number;
          amount: number;
          transport_cost?: number;
          commission?: number;
          net_amount: number;
          payment_method: PaymentMethodDb;
          date?: string;
          remarks?: string | null;
          recorded_by: string;
          created_at?: string;
        },
        Partial<{
          quantity: number;
          rate: number;
          amount: number;
          transport_cost: number;
          commission: number;
          net_amount: number;
          payment_method: PaymentMethodDb;
          remarks: string | null;
        }>
      >;
      expenses: Table<
        {
          id: string;
          farm_id: string;
          category: ExpenseCategoryDb;
          amount: number;
          date: string;
          bill_image_url: string | null;
          notes: string | null;
          recorded_by: string;
          created_at: string;
        },
        {
          id?: string;
          farm_id: string;
          category: ExpenseCategoryDb;
          amount: number;
          date?: string;
          bill_image_url?: string | null;
          notes?: string | null;
          recorded_by: string;
          created_at?: string;
        },
        Partial<{
          category: ExpenseCategoryDb;
          amount: number;
          bill_image_url: string | null;
          notes: string | null;
        }>
      >;
      notifications: Table<
        {
          id: string;
          farm_id: string;
          user_id: string | null;
          title: string;
          body: string;
          type: NotificationType;
          is_read: boolean;
          created_at: string;
        },
        {
          id?: string;
          farm_id: string;
          user_id?: string | null;
          title: string;
          body: string;
          type: NotificationType;
          is_read?: boolean;
          created_at?: string;
        },
        Partial<{ is_read: boolean }>
      >;
      settings: Table<
        {
          farm_id: string;
          notifications_enabled: boolean;
          low_stock_alerts_enabled: boolean;
          attendance_reminder_time: string;
          theme: "light" | "dark" | "system";
          updated_at: string;
        },
        {
          farm_id: string;
          notifications_enabled?: boolean;
          low_stock_alerts_enabled?: boolean;
          attendance_reminder_time?: string;
          theme?: "light" | "dark" | "system";
          updated_at?: string;
        },
        Partial<{
          notifications_enabled: boolean;
          low_stock_alerts_enabled: boolean;
          attendance_reminder_time: string;
          theme: "light" | "dark" | "system";
        }>
      >;
      activity_logs: Table<
        {
          id: string;
          farm_id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json | null;
          created_at: string;
        },
        {
          id?: string;
          farm_id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        },
        // Append-only — no updatable fields.
        Record<string, never>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      complete_owner_profile: {
        Args: { p_full_name: string; p_farm_name: string };
        Returns: Database["public"]["Tables"]["users"]["Row"];
      };
      current_farm_id: { Args: Record<string, never>; Returns: string | null };
      current_role: { Args: Record<string, never>; Returns: string | null };
    };
    Enums: Record<string, never>;
  };
}
