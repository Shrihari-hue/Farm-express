import { Schema, model, type Types } from "mongoose";
import { applyIdTransform } from "../utils/toJSONPlugin";

export type UserRole = "owner" | "supervisor" | "labour";

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  farmId: Types.ObjectId | null;
  fullName: string;
  role: UserRole;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false keeps the hash out of normal queries; explicitly
    // `.select("+passwordHash")` where it's needed (login).
    passwordHash: { type: String, required: true, select: false },
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", default: null },
    fullName: { type: String, required: true, default: "" },
    role: { type: String, enum: ["owner", "supervisor", "labour"], required: true, default: "owner" },
    phone: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    isActive: { type: Boolean, required: true, default: true },
  },
  // Postgres table only has created_at, no updated_at.
  { timestamps: { createdAt: true, updatedAt: false } }
);

userSchema.index({ farmId: 1 });

applyIdTransform(userSchema, { hide: ["passwordHash"] });

export const User = model<IUser>("User", userSchema);
