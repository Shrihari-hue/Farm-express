import { Schema, model, type Types } from "mongoose";
import { applyIdTransform } from "../utils/toJSONPlugin";

export interface IFarm {
  _id: Types.ObjectId;
  name: string;
  ownerId: Types.ObjectId;
  location: string | null;
  phone: string | null;
  currency: string;
  language: string;
  createdAt: Date;
}

const farmSchema = new Schema<IFarm>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, default: null },
    phone: { type: String, default: null },
    currency: { type: String, required: true, default: "INR" },
    language: { type: String, required: true, default: "en" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

farmSchema.index({ ownerId: 1 });

applyIdTransform(farmSchema);

export const Farm = model<IFarm>("Farm", farmSchema);
