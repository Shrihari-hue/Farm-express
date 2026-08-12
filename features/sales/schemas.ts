import { z } from "zod";
import { nonEmptyString } from "@utils/validation";
import { PAYMENT_METHODS, type PaymentMethod } from "@constants/config";

const paymentMethodValues = Object.values(PAYMENT_METHODS) as [PaymentMethod, ...PaymentMethod[]];

function positiveIssue(ctx: z.RefinementCtx, path: string, label: string, value: string) {
  const n = Number(value);
  if (!value.trim() || Number.isNaN(n) || n <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: `${label} must be greater than 0` });
  }
}

function nonNegativeOptionalIssue(ctx: z.RefinementCtx, path: string, label: string, value: string) {
  if (!value.trim()) return;
  const n = Number(value);
  if (Number.isNaN(n) || n < 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: `${label} must be a number ≥ 0` });
  }
}

export const saleFormSchema = z
  .object({
    stockItemId: nonEmptyString("Stock item"),
    stockItemLabel: z.string(),
    buyerId: nonEmptyString("Buyer"),
    buyerLabel: z.string(),
    quantity: z.string().trim(),
    rate: z.string().trim(),
    transportCost: z.string().trim(),
    commission: z.string().trim(),
    paymentMethod: z.enum(paymentMethodValues),
    date: z.string().trim().min(1, "Date is required"),
    remarks: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    positiveIssue(ctx, "quantity", "Quantity", values.quantity);
    positiveIssue(ctx, "rate", "Rate", values.rate);
    nonNegativeOptionalIssue(ctx, "transportCost", "Transport cost", values.transportCost);
    nonNegativeOptionalIssue(ctx, "commission", "Commission", values.commission);
  });
export type SaleFormSchema = z.infer<typeof saleFormSchema>;

export const EMPTY_SALE_FORM: SaleFormSchema = {
  stockItemId: "",
  stockItemLabel: "",
  buyerId: "",
  buyerLabel: "",
  quantity: "",
  rate: "",
  transportCost: "",
  commission: "",
  paymentMethod: "cash",
  date: "",
  remarks: "",
};

export const buyerQuickAddSchema = z.object({
  name: nonEmptyString("Name"),
  phone: z.string().trim(),
});
export type BuyerQuickAddSchema = z.infer<typeof buyerQuickAddSchema>;
