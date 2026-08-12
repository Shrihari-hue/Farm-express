import { Schema, model, type Types } from "mongoose";
import { applyIdTransform } from "../utils/toJSONPlugin";

/**
 * Placeholder schema only — no routes are built for this yet (Step 10 "Sales"
 * is not implemented in the app). Referenced by Sale.buyerId.
 */
export interface IBuyer {
  _id: Types.ObjectId;
  farmId: Types.ObjectId;
  name: string;
  phone: string | null;
  address: string | null;
  createdAt: Date;
}

const buyerSchema = new Schema<IBuyer>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: null },
    address: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

buyerSchema.index({ farmId: 1 });

applyIdTransform(buyerSchema);

export const Buyer = model<IBuyer>("Buyer", buyerSchema);
