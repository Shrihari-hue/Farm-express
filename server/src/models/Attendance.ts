import { Schema, model, type Types } from "mongoose";
import { applyIdTransform } from "../utils/toJSONPlugin";

export type AttendanceStatus = "present" | "absent" | "half_day" | "leave" | "late";

export interface IAttendance {
  _id: Types.ObjectId;
  farmId: Types.ObjectId;
  workerId: Types.ObjectId;
  date: string;
  status: AttendanceStatus;
  todaysWage: number | null;
  workDone: string | null;
  remarks: string | null;
  markedBy: Types.ObjectId;
  createdAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    workerId: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ["present", "absent", "half_day", "leave", "late"],
      required: true,
    },
    todaysWage: {
      type: Number,
      default: null,
      min: [0, "todaysWage must be >= 0"],
    },
    workDone: { type: String, default: null },
    remarks: { type: String, default: null },
    markedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Load-bearing: the app upserts on this exact pair instead of allowing duplicates.
attendanceSchema.index({ workerId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ farmId: 1, date: 1 });

applyIdTransform(attendanceSchema);

export const Attendance = model<IAttendance>("Attendance", attendanceSchema);
