import { Schema, model, type Types } from "mongoose";
import { applyIdTransform } from "../utils/toJSONPlugin";

export type ExpenseCategory =
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

export interface IExpense {
  _id: Types.ObjectId;
  farmId: Types.ObjectId;
  category: ExpenseCategory;
  amount: number;
  date: string;
  billImageUrl: string | null;
  notes: string | null;
  recordedBy: Types.ObjectId;
  createdAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    category: {
      type: String,
      enum: [
        "fertilizer",
        "fuel",
        "pesticides",
        "seeds",
        "electricity",
        "water",
        "maintenance",
        "machine_repair",
        "transport",
        "miscellaneous",
      ],
      required: true,
    },
    amount: { type: Number, required: true, min: [0.01, "amount must be > 0"] },
    date: { type: String, required: true },
    billImageUrl: { type: String, default: null },
    notes: { type: String, default: null },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

expenseSchema.index({ farmId: 1, date: 1 });
expenseSchema.index({ farmId: 1, category: 1 });

applyIdTransform(expenseSchema);

export const Expense = model<IExpense>("Expense", expenseSchema);
