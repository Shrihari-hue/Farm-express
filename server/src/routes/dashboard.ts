import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { Worker } from "../models/Worker";
import { Attendance } from "../models/Attendance";
import { Sale } from "../models/Sale";
import { Expense } from "../models/Expense";
import { StockItem } from "../models/StockItem";
import { ActivityLog } from "../models/ActivityLog";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireFarmScope } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireFarmScope);

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format");

function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// GET /api/dashboard/worker-counts — { permanent, casual } (active only)
router.get(
  "/worker-counts",
  asyncHandler(async (req, res) => {
    const farmId = req.user!.farmId;
    const [permanent, casual] = await Promise.all([
      Worker.countDocuments({ farmId, type: "permanent", status: "active" }),
      Worker.countDocuments({ farmId, type: "casual", status: "active" }),
    ]);
    res.json({ permanent, casual });
  })
);

// GET /api/dashboard/attendance-summary?date=
router.get(
  "/attendance-summary",
  asyncHandler(async (req, res) => {
    const date = dateStringSchema.parse(req.query.date);
    const rows = await Attendance.find({ farmId: req.user!.farmId, date }).select("status").lean();

    const summary = { present: 0, absent: 0, halfDay: 0, leave: 0, late: 0, totalMarked: rows.length };
    for (const row of rows) {
      switch (row.status) {
        case "present":
          summary.present += 1;
          break;
        case "absent":
          summary.absent += 1;
          break;
        case "half_day":
          summary.halfDay += 1;
          break;
        case "leave":
          summary.leave += 1;
          break;
        case "late":
          summary.late += 1;
          break;
        default:
          break;
      }
    }

    res.json(summary);
  })
);

// GET /api/dashboard/sales-total?date= — { total } (sum of netAmount)
router.get(
  "/sales-total",
  asyncHandler(async (req, res) => {
    const date = dateStringSchema.parse(req.query.date);
    const [result] = await Sale.aggregate([
      { $match: { farmId: toObjectId(req.user!.farmId!), date } },
      { $group: { _id: null, total: { $sum: "$netAmount" } } },
    ]);
    res.json({ total: result?.total ?? 0 });
  })
);

// GET /api/dashboard/expenses-total?date= — { total } (sum of amount)
router.get(
  "/expenses-total",
  asyncHandler(async (req, res) => {
    const date = dateStringSchema.parse(req.query.date);
    const [result] = await Expense.aggregate([
      { $match: { farmId: toObjectId(req.user!.farmId!), date } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    res.json({ total: result?.total ?? 0 });
  })
);

// GET /api/dashboard/stock-summary — { lowStockCount }
router.get(
  "/stock-summary",
  asyncHandler(async (req, res) => {
    const lowStockCount = await StockItem.countDocuments({
      farmId: req.user!.farmId,
      lowStockThreshold: { $ne: null },
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
    });
    res.json({ lowStockCount });
  })
);

// GET /api/dashboard/recent-activity?limit=8
router.get(
  "/recent-activity",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 100);
    const rows = await ActivityLog.find({ farmId: req.user!.farmId }).sort({ createdAt: -1 }).limit(limit);
    res.json({ activity: rows.map((r) => r.toJSON()) });
  })
);

// GET /api/dashboard/weekly-trend?today=YYYY-MM-DD — 7-day { date, sales, expenses }[]
router.get(
  "/weekly-trend",
  asyncHandler(async (req, res) => {
    const today = dateStringSchema.parse(req.query.today);
    const startDate = addDaysToDateString(today, -6);
    const farmId = toObjectId(req.user!.farmId!);

    const [salesByDate, expensesByDate] = await Promise.all([
      Sale.aggregate([
        { $match: { farmId, date: { $gte: startDate, $lte: today } } },
        { $group: { _id: "$date", total: { $sum: "$netAmount" } } },
      ]),
      Expense.aggregate([
        { $match: { farmId, date: { $gte: startDate, $lte: today } } },
        { $group: { _id: "$date", total: { $sum: "$amount" } } },
      ]),
    ]);

    const salesMap = new Map<string, number>(salesByDate.map((r) => [r._id, r.total]));
    const expensesMap = new Map<string, number>(expensesByDate.map((r) => [r._id, r.total]));

    const trend = [];
    for (let i = 0; i < 7; i += 1) {
      const date = addDaysToDateString(startDate, i);
      trend.push({
        date,
        sales: salesMap.get(date) ?? 0,
        expenses: expensesMap.get(date) ?? 0,
      });
    }

    res.json({ trend });
  })
);

export default router;
