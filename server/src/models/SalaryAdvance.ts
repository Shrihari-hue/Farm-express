import { Schema, model, type Types } from "mongoose";
import { applyIdTransform } from "../utils/toJSONPlugin";

/**
 * Placeholder schema only — no routes are built for this yet (Step 8 "Salary"
 * is not implemented in the app). Kept so the collection/shape exists ahead of time.
 */
export interface ISalaryAdvance {
  _id: Types.ObjectId;
  farmId: Types.ObjectId;
  workerId: Types.ObjectId;
  date: string;
  amount: number;
  reason: string | null;
  remainingBalance: number;
  createdAt: Date;
}

const salaryAdvanceSchema = new Schema<ISalaryAdvance>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    workerId: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
    date: { type: String, required: true },
    amount: { type: Number, required: true, min: [0.01, "amount must be > 0"] },
    reason: { type: String, default: null },
    remainingBalance: { type: Number, required: true, min: [0, "remainingBalance must be >= 0"] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

salaryAdvanceSchema.index({ workerId: 1, date: 1 });
salaryAdvanceSchema.index({ farmId: 1 });

applyIdTransform(salaryAdvanceSchema);

export const SalaryAdvance = model<ISalaryAdvance>("SalaryAdvance", salaryAdvanceSchema);
