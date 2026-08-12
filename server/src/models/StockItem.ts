import { Schema, model, type Types } from "mongoose";
import { applyIdTransform } from "../utils/toJSONPlugin";

export type StockCategory =
  | "coconut_bags"
  | "arecanut_bags"
  | "pepper"
  | "banana"
  | "coffee"
  | "mango"
  | "custom";

export interface IStockItem {
  _id: Types.ObjectId;
  farmId: Types.ObjectId;
  category: StockCategory;
  name: string;
  unit: string;
  quantity: number;
  location: string | null;
  lowStockThreshold: number | null;
  addedBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const stockItemSchema = new Schema<IStockItem>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    category: {
      type: String,
      enum: ["coconut_bags", "arecanut_bags", "pepper", "banana", "coffee", "mango", "custom"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0, min: [0, "quantity must be >= 0"] },
    location: { type: String, default: null },
    lowStockThreshold: {
      type: Number,
      default: null,
      min: [0, "lowStockThreshold must be >= 0"],
    },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

stockItemSchema.index({ farmId: 1 });
stockItemSchema.index({ farmId: 1, name: 1 }, { unique: true });

applyIdTransform(stockItemSchema);

export const StockItem = model<IStockItem>("StockItem", stockItemSchema);
