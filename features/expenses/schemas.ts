import { z } from "zod";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@constants/config";

const expenseCategoryValues = Object.values(EXPENSE_CATEGORIES) as [ExpenseCategory, ...ExpenseCategory[]];

export const expenseFormSchema = z
  .object({
    category: z.enum(expenseCategoryValues),
    amount: z.string().trim(),
    date: z.string().trim().min(1, "Date is required"),
    notes: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    const n = Number(values.amount);
    if (!values.amount.trim() || Number.isNaN(n) || n <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["amount"], message: "Amount must be greater than 0" });
    }
  });
export type ExpenseFormSchema = z.infer<typeof expenseFormSchema>;

export const EMPTY_EXPENSE_FORM: Omit<ExpenseFormSchema, "date"> = {
  category: "miscellaneous",
  amount: "",
  notes: "",
};
