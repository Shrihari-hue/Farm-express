import { Schema, model, type Types } from "mongoose";
import { applyIdTransform } from "../utils/toJSONPlugin";

export type PaymentMethod = "cash" | "upi" | "bank" | "credit";

export interface ISale {
  _id: Types.ObjectId;
  farmId: Types.ObjectId;
  stockItemId: Types.ObjectId;
  buyerId: Types.ObjectId;
  quantity: number;
  rate: number;
  amount: number;
  transportCost: number;
  commission: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  date: string;
  remarks: string | null;
  recordedBy: Types.ObjectId;
  createdAt: Date;
}

const saleSchema = new Schema<ISale>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    stockItemId: { type: Schema.Types.ObjectId, ref: "StockItem", required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "Buyer", required: true },
    quantity: { type: Number, required: true, min: [0.01, "quantity must be > 0"] },
    rate: { type: Number, required: true, min: [0, "rate must be >= 0"] },
    amount: { type: Number, required: true, min: [0, "amount must be >= 0"] },
    transportCost: { type: Number, required: true, default: 0, min: [0, "transportCost must be >= 0"] },
    commission: { type: Number, required: true, default: 0, min: [0, "commission must be >= 0"] },
    netAmount: { type: Number, required: true, min: [0, "netAmount must be >= 0"] },
    paymentMethod: { type: String, enum: ["cash", "upi", "bank", "credit"], required: true },
    date: { type: String, required: true },
    remarks: { type: String, default: null },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

saleSchema.index({ farmId: 1, date: 1 });
saleSchema.index({ buyerId: 1 });

applyIdTransform(saleSchema);

export const Sale = model<ISale>("Sale", saleSchema);
