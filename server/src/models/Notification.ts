import { Schema, model, type Types } from "mongoose";
import { applyIdTransform } from "../utils/toJSONPlugin";

/**
 * Placeholder schema only — no routes are built for this yet (Step 13
 * "Notifications" is not implemented in the app).
 */
export type NotificationType = "attendance" | "stock" | "salary" | "payment" | "low_stock" | "general";

export interface IAppNotification {
  _id: Types.ObjectId;
  farmId: Types.ObjectId;
  userId: Types.ObjectId | null;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<IAppNotification>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    // null = farm-wide broadcast
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ["attendance", "stock", "salary", "payment", "low_stock", "general"],
      required: true,
    },
    isRead: { type: Boolean, required: true, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ farmId: 1, createdAt: -1 });

applyIdTransform(notificationSchema);

export const AppNotification = model<IAppNotification>("Notification", notificationSchema);
