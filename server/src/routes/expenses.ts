import { Router } from "express";
import { z } from "zod";
import { Expense } from "../models/Expense";
import { ActivityLog } from "../models/ActivityLog";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireFarmScope, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireFarmScope);

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format");

const createExpenseSchema = z.object({
  category: z.enum([
    "fertilizer",
    "fuel",
    "pesticides",
    "seeds",
    "electricity",
    "water",
    "maintenance",
    "machine_repair",
    "transport",
    "miscellaneous",
  ]),
  amount: z.number().min(0.01),
  date: dateStringSchema,
  billImageUrl: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// GET /api/expenses?startDate=&endDate=
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const startDate = dateStringSchema.parse(req.query.startDate);
    const endDate = dateStringSchema.parse(req.query.endDate);
    const rows = await Expense.find({
      farmId: req.user!.farmId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1, createdAt: -1 });
    res.json({ expenses: rows.map((r) => r.toJSON()) });
  })
);

// GET /api/expenses/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const expense = await Expense.findOne({ _id: req.params.id, farmId: req.user!.farmId });
    if (!expense) {
      throw new AppError(404, "Expense not found");
    }
    res.json({ expense: expense.toJSON() });
  })
);

// POST /api/expenses
router.post(
  "/",
  requireRole("owner", "supervisor", "labour"),
  asyncHandler(async (req, res) => {
    const payload = createExpenseSchema.parse(req.body);
    const expense = await Expense.create({
      ...payload,
      billImageUrl: payload.billImageUrl ?? null,
      notes: payload.notes ?? null,
      farmId: req.user!.farmId,
      recordedBy: req.user!.id,
    });

    await ActivityLog.create({
      farmId: req.user!.farmId,
      userId: req.user!.id,
      action: "expense_recorded",
      entityType: "expense",
      entityId: expense._id.toString(),
      metadata: { category: expense.category, amount: expense.amount },
    });

    res.status(201).json({ expense: expense.toJSON() });
  })
);

// DELETE /api/expenses/:id — owner only
router.delete(
  "/:id",
  requireRole("owner"),
  asyncHandler(async (req, res) => {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, farmId: req.user!.farmId });
    if (!expense) {
      throw new AppError(404, "Expense not found");
    }
    res.status(204).send();
  })
);

export default router;
