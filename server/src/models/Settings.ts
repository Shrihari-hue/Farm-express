import { Schema, model, type Types } from "mongoose";
import { applyIdTransform } from "../utils/toJSONPlugin";

/**
 * Placeholder schema only — no routes are built for this yet (Settings screen,
 * Step 13, is not implemented in the app). In Postgres this table's primary key
 * IS `farm_id` (one row per farm); here we model it the same way with a unique
 * `farmId` and let Mongo generate its own `_id`.
 */
export interface ISettings {
  _id: Types.ObjectId;
  farmId: Types.ObjectId;
  notificationsEnabled: boolean;
  lowStockAlertsEnabled: boolean;
  attendanceReminderTime: string;
  theme: "light" | "dark" | "system";
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true, unique: true },
    notificationsEnabled: { type: Boolean, required: true, default: true },
    lowStockAlertsEnabled: { type: Boolean, required: true, default: true },
    attendanceReminderTime: { type: String, required: true, default: "19:00" },
    theme: { type: String, enum: ["light", "dark", "system"], required: true, default: "system" },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

applyIdTransform(settingsSchema);

export const Settings = model<ISettings>("Settings", settingsSchema);
