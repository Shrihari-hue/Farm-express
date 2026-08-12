import { Schema, model, type Types } from "mongoose";
import { applyIdTransform } from "../utils/toJSONPlugin";

/**
 * Placeholder schema only — no routes are built for this yet (Step 9 "Stock
 * Register" is not implemented in the app). Append-only by design once routes
 * are added: never expose UPDATE/DELETE endpoints for this collection.
 */
export interface IStockHistory {
  _id: Types.ObjectId;
  farmId: Types.ObjectId;
  stockItemId: Types.ObjectId;
  date: string;
  openingQuantity: number;
  harvestedToday: number;
  soldToday: number;
  damaged: number;
  remainingStock: number;
  notes: string | null;
  recordedBy: Types.ObjectId;
  createdAt: Date;
}

const stockHistorySchema = new Schema<IStockHistory>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    stockItemId: { type: Schema.Types.ObjectId, ref: "StockItem", required: true },
    date: { type: String, required: true },
    openingQuantity: { type: Number, required: true, default: 0 },
    harvestedToday: { type: Number, required: true, default: 0, min: 0 },
    soldToday: { type: Number, required: true, default: 0, min: 0 },
    damaged: { type: Number, required: true, default: 0, min: 0 },
    remainingStock: { type: Number, required: true, default: 0, min: 0 },
    notes: { type: String, default: null },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

stockHistorySchema.index({ stockItemId: 1, date: 1 }, { unique: true });
stockHistorySchema.index({ farmId: 1, date: 1 });

applyIdTransform(stockHistorySchema);

export const StockHistory = model<IStockHistory>("StockHistory", stockHistorySchema);
