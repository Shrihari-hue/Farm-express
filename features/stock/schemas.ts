import { z } from "zod";
import { nonEmptyString } from "@utils/validation";
import { STOCK_CATEGORIES, type StockCategory } from "@constants/config";

const stockCategoryValues = Object.values(STOCK_CATEGORIES) as [StockCategory, ...StockCategory[]];

function numericFieldIssue(ctx: z.RefinementCtx, path: string, label: string, value: string, allowEmpty: boolean) {
  if (!value.trim()) {
    if (allowEmpty) return;
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: `${label} is required` });
    return;
  }
  const n = Number(value);
  if (Number.isNaN(n) || n < 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: `${label} must be a number ≥ 0` });
  }
}

export const stockItemFormSchema = z
  .object({
    category: z.enum(stockCategoryValues),
    name: nonEmptyString("Name"),
    unit: nonEmptyString("Unit"),
    quantity: z.string().trim(),
    location: z.string().trim(),
    lowStockThreshold: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    numericFieldIssue(ctx, "quantity", "Starting quantity", values.quantity, true);
    numericFieldIssue(ctx, "lowStockThreshold", "Low stock threshold", values.lowStockThreshold, true);
  });
export type StockItemFormSchema = z.infer<typeof stockItemFormSchema>;

export const EMPTY_STOCK_ITEM_FORM: StockItemFormSchema = {
  category: "coconut_bags",
  name: "",
  unit: "",
  quantity: "",
  location: "",
  lowStockThreshold: "",
};

export const stockHistoryFormSchema = z
  .object({
    harvestedToday: z.string().trim(),
    soldToday: z.string().trim(),
    damaged: z.string().trim(),
    notes: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    numericFieldIssue(ctx, "harvestedToday", "Harvested", values.harvestedToday, true);
    numericFieldIssue(ctx, "soldToday", "Sold", values.soldToday, true);
    numericFieldIssue(ctx, "damaged", "Damaged", values.damaged, true);
  });
export type StockHistoryFormSchema = z.infer<typeof stockHistoryFormSchema>;

export const EMPTY_STOCK_HISTORY_FORM: StockHistoryFormSchema = {
  harvestedToday: "",
  soldToday: "",
  damaged: "",
  notes: "",
};
