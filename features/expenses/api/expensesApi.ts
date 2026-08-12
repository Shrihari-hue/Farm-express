import { apiClient } from "@services/api/client";
import type { ExpenseCategory } from "@constants/config";
import type { Expense } from "@app-types/models";

export async function listExpenses(startDate: string, endDate: string): Promise<Expense[]> {
  const { expenses } = await apiClient.get<{ expenses: Expense[] }>(
    `/api/expenses?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
  );
  return expenses;
}

export interface RecordExpensePayload {
  category: ExpenseCategory;
  amount: number;
  date: string;
  billImageUrl?: string | null;
  notes: string | null;
}

export async function recordExpense(payload: RecordExpensePayload): Promise<Expense> {
  const { expense } = await apiClient.post<{ expense: Expense }>("/api/expenses", payload);
  return expense;
}

export async function deleteExpense(id: string): Promise<void> {
  await apiClient.del<void>(`/api/expenses/${encodeURIComponent(id)}`);
}
