import { Schema, model, type Types } from "mongoose";
import { applyIdTransform } from "../utils/toJSONPlugin";

/**
 * Placeholder schema only — no routes are built for this yet (Step 8 "Salary"
 * is not implemented in the app).
 */
export interface ISalaryPayment {
  _id: Types.ObjectId;
  farmId: Types.ObjectId;
  workerId: Types.ObjectId;
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
  paidAt: Date | null;
  createdAt: Date;
}

const salaryPaymentSchema = new Schema<ISalaryPayment>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    workerId: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
    periodStart: { type: String, required: true },
    periodEnd: { type: String, required: true },
    workingDays: { type: Number, required: true, default: 0 },
    leaves: { type: Number, required: true, default: 0 },
    halfDays: { type: Number, required: true, default: 0 },
    advanceDeducted: { type: Number, required: true, default: 0, min: 0 },
    bonuses: { type: Number, required: true, default: 0, min: 0 },
    deductions: { type: Number, required: true, default: 0, min: 0 },
    grossAmount: { type: Number, required: true, min: 0 },
    netAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "paid"], required: true, default: "pending" },
    paidAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Cross-field check (period_end >= period_start) has no native Mongo equivalent —
// reimplemented here as an application-level validator.
salaryPaymentSchema.pre("validate", function (next) {
  if (this.periodEnd < this.periodStart) {
    next(new Error("periodEnd must be greater than or equal to periodStart"));
    return;
  }
  next();
});

salaryPaymentSchema.index({ farmId: 1, periodStart: 1 });
salaryPaymentSchema.index({ farmId: 1, status: 1 });
salaryPaymentSchema.index({ workerId: 1, periodStart: 1, periodEnd: 1 }, { unique: true });

applyIdTransform(salaryPaymentSchema);

export const SalaryPayment = model<ISalaryPayment>("SalaryPayment", salaryPaymentSchema);
