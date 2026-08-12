import { Schema, model, type Types } from "mongoose";
import { applyIdTransform } from "../utils/toJSONPlugin";

export type LabourType = "permanent" | "casual";
export type WorkerStatus = "active" | "inactive";

export interface BankDetails {
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
  bankName?: string;
  branch?: string;
}

export interface IWorker {
  _id: Types.ObjectId;
  farmId: Types.ObjectId;
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
  status: WorkerStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const bankDetailsSchema = new Schema<BankDetails>(
  {
    accountHolder: { type: String },
    accountNumber: { type: String },
    ifsc: { type: String },
    bankName: { type: String },
    branch: { type: String },
  },
  { _id: false }
);

const workerSchema = new Schema<IWorker>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    type: { type: String, enum: ["permanent", "casual"], required: true },
    name: { type: String, required: true, trim: true },
    photoUrl: { type: String, default: null },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    village: { type: String, default: null },
    // Stored as 'YYYY-MM-DD' string (matches attendance.date convention), not a Date,
    // so there is no ambiguity/timezone shifting at the API boundary.
    joiningDate: { type: String, default: null },
    monthlySalary: {
      type: Number,
      default: null,
      min: [0, "monthlySalary must be >= 0"],
    },
    dailyWage: {
      type: Number,
      default: null,
      min: [0, "dailyWage must be >= 0"],
    },
    bankDetails: { type: bankDetailsSchema, default: null },
    status: { type: String, enum: ["active", "inactive"], required: true, default: "active" },
    notes: { type: String, default: null },
  },
  // Postgres table has both created_at and updated_at + a set_updated_at trigger.
  { timestamps: true }
);

workerSchema.index({ farmId: 1 });
workerSchema.index({ farmId: 1, type: 1 });
workerSchema.index({ farmId: 1, status: 1 });

applyIdTransform(workerSchema);

export const Worker = model<IWorker>("Worker", workerSchema);
