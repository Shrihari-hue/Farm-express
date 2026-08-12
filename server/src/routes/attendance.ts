import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { Attendance, type IAttendance } from "../models/Attendance";
import { Worker } from "../models/Worker";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireFarmScope, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireFarmScope);

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format");

const markAttendanceSchema = z.object({
  workerId: z.string().min(1),
  date: dateStringSchema,
  status: z.enum(["present", "absent", "half_day", "leave", "late"]),
  todaysWage: z.number().min(0).nullable().optional(),
  workDone: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  markedBy: z.string().min(1),
});

const bulkMarkSchema = z.object({
  date: dateStringSchema,
  workerIds: z.array(z.string().min(1)).min(1),
  markedBy: z.string().min(1),
});

// GET /api/attendance?date=YYYY-MM-DD — all rows for farm+date
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const date = dateStringSchema.parse(req.query.date);
    const rows = await Attendance.find({ farmId: req.user!.farmId, date });
    res.json({ attendance: rows.map((r) => r.toJSON()) });
  })
);

// GET /api/attendance/worker/:workerId?startDate=&endDate= — range query, ascending
router.get(
  "/worker/:workerId",
  asyncHandler(async (req, res) => {
    const startDate = dateStringSchema.parse(req.query.startDate);
    const endDate = dateStringSchema.parse(req.query.endDate);

    const worker = await Worker.findOne({ _id: req.params.workerId, farmId: req.user!.farmId });
    if (!worker) {
      throw new AppError(404, "Worker not found");
    }

    const rows = await Attendance.find({
      farmId: req.user!.farmId,
      workerId: req.params.workerId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    res.json({ attendance: rows.map((r) => r.toJSON()) });
  })
);

// GET /api/attendance/overview?monthStart=&monthEnd= — per-day { date, markedCount, presentCount }
router.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const monthStart = dateStringSchema.parse(req.query.monthStart);
    const monthEnd = dateStringSchema.parse(req.query.monthEnd);

    const farmId = new mongoose.Types.ObjectId(req.user!.farmId!);

    const rows = await Attendance.aggregate([
      { $match: { farmId, date: { $gte: monthStart, $lte: monthEnd } } },
      {
        $group: {
          _id: "$date",
          markedCount: { $sum: 1 },
          presentCount: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
        },
      },
      { $project: { _id: 0, date: "$_id", markedCount: 1, presentCount: 1 } },
      { $sort: { date: 1 } },
    ]);

    res.json({ overview: rows });
  })
);

// PUT /api/attendance — upsert one record on { workerId, date }
router.put(
  "/",
  requireRole("owner", "supervisor", "labour"),
  asyncHandler(async (req, res) => {
    const payload = markAttendanceSchema.parse(req.body);

    const worker = await Worker.findOne({ _id: payload.workerId, farmId: req.user!.farmId });
    if (!worker) {
      throw new AppError(404, "Worker not found");
    }

    const record = await Attendance.findOneAndUpdate(
      { workerId: payload.workerId, date: payload.date },
      {
        $set: {
          farmId: req.user!.farmId,
          workerId: payload.workerId,
          date: payload.date,
          status: payload.status,
          todaysWage: payload.todaysWage ?? null,
          workDone: payload.workDone ?? null,
          remarks: payload.remarks ?? null,
          markedBy: payload.markedBy,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.json({ attendance: record!.toJSON() });
  })
);

// PUT /api/attendance/bulk — upsert every worker as status: 'present' for that date
router.put(
  "/bulk",
  requireRole("owner", "supervisor", "labour"),
  asyncHandler(async (req, res) => {
    const { date, workerIds, markedBy } = bulkMarkSchema.parse(req.body);

    const workers = await Worker.find({ _id: { $in: workerIds }, farmId: req.user!.farmId }).select("_id");
    const validIds = new Set(workers.map((w) => w._id.toString()));
    const missing = workerIds.filter((id) => !validIds.has(id));
    if (missing.length > 0) {
      throw new AppError(404, `Worker(s) not found: ${missing.join(", ")}`);
    }

    const farmObjectId = new mongoose.Types.ObjectId(req.user!.farmId!);
    const markedByObjectId = new mongoose.Types.ObjectId(markedBy);

    const operations: mongoose.AnyBulkWriteOperation<IAttendance>[] = workerIds.map(
      (workerId) => ({
        updateOne: {
          filter: { workerId: new mongoose.Types.ObjectId(workerId), date },
          update: {
            $set: {
              farmId: farmObjectId,
              workerId: new mongoose.Types.ObjectId(workerId),
              date,
              status: "present",
              markedBy: markedByObjectId,
            },
            $setOnInsert: { todaysWage: null, workDone: null, remarks: null },
          },
          upsert: true,
        },
      })
    );

    await Attendance.bulkWrite(operations);
    res.status(204).send();
  })
);

export default router;
