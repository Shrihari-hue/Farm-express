import { Schema, model, type Types } from "mongoose";
import { applyIdTransform } from "../utils/toJSONPlugin";

export interface IActivityLog {
  _id: Types.ObjectId;
  farmId: Types.ObjectId;
  userId: Types.ObjectId;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    // Polymorphic reference (can point at a farm, worker, etc.) — stored as a
    // plain string id rather than a typed ObjectId ref, matching the nullable
    // untyped `uuid` column in Postgres.
    entityId: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Append-only table: no route ever updates/deletes a document (enforced at the
// route layer — Mongo has no native equivalent of "no UPDATE/DELETE policy").
activityLogSchema.index({ farmId: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });

applyIdTransform(activityLogSchema);

export const ActivityLog = model<IActivityLog>("ActivityLog", activityLogSchema);
