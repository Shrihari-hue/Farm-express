import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { StockItem } from "../models/StockItem";
import { StockHistory } from "../models/StockHistory";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireFarmScope, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireFarmScope);

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format");

const createStockItemSchema = z.object({
  category: z.enum(["coconut_bags", "arecanut_bags", "pepper", "banana", "coffee", "mango", "custom"]),
  name: z.string().trim().min(1, "name is required"),
  unit: z.string().trim().min(1, "unit is required"),
  quantity: z.number().min(0).optional(),
  location: z.string().nullable().optional(),
  lowStockThreshold: z.number().min(0).nullable().optional(),
});

const updateStockItemSchema = createStockItemSchema.partial();

const historyUpsertSchema = z.object({
  date: dateStringSchema,
  harvestedToday: z.number().min(0).default(0),
  soldToday: z.number().min(0).default(0),
  damaged: z.number().min(0).default(0),
  notes: z.string().nullable().optional(),
});

// GET /api/stock?category=
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = { farmId: req.user!.farmId };
    if (typeof req.query.category === "string" && req.query.category.length > 0) {
      filter.category = req.query.category;
    }
    const items = await StockItem.find(filter).sort({ name: 1 });
    res.json({ stockItems: items.map((i) => i.toJSON()) });
  })
);

// GET /api/stock/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await StockItem.findOne({ _id: req.params.id, farmId: req.user!.farmId });
    if (!item) {
      throw new AppError(404, "Stock item not found");
    }
    res.json({ stockItem: item.toJSON() });
  })
);

// GET /api/stock/:id/history?startDate=&endDate=
router.get(
  "/:id/history",
  asyncHandler(async (req, res) => {
    const startDate = dateStringSchema.parse(req.query.startDate);
    const endDate = dateStringSchema.parse(req.query.endDate);

    const item = await StockItem.findOne({ _id: req.params.id, farmId: req.user!.farmId });
    if (!item) {
      throw new AppError(404, "Stock item not found");
    }

    const rows = await StockHistory.find({
      farmId: req.user!.farmId,
      stockItemId: req.params.id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    res.json({ history: rows.map((r) => r.toJSON()) });
  })
);

// POST /api/stock
router.post(
  "/",
  requireRole("owner", "supervisor", "labour"),
  asyncHandler(async (req, res) => {
    const payload = createStockItemSchema.parse(req.body);
    const item = await StockItem.create({
      ...payload,
      quantity: payload.quantity ?? 0,
      farmId: req.user!.farmId,
      addedBy: req.user!.id,
      updatedBy: req.user!.id,
    });
    res.status(201).json({ stockItem: item.toJSON() });
  })
);

// PATCH /api/stock/:id
router.patch(
  "/:id",
  requireRole("owner", "supervisor", "labour"),
  asyncHandler(async (req, res) => {
    const payload = updateStockItemSchema.parse(req.body);
    const item = await StockItem.findOneAndUpdate(
      { _id: req.params.id, farmId: req.user!.farmId },
      { $set: { ...payload, updatedBy: req.user!.id } },
      { new: true, runValidators: true }
    );
    if (!item) {
      throw new AppError(404, "Stock item not found");
    }
    res.json({ stockItem: item.toJSON() });
  })
);

// PUT /api/stock/:id/history — upsert one day's harvest/sold/damaged entry,
// mirrors attendance's upsert-by-date pattern. Recomputes remainingStock
// from the previous day's closing balance (or the item's current quantity
// if this is the item's first-ever entry) and syncs StockItem.quantity to
// match, so the item list always reflects the latest recorded day.
router.put(
  "/:id/history",
  requireRole("owner", "supervisor", "labour"),
  asyncHandler(async (req, res) => {
    const payload = historyUpsertSchema.parse(req.body);

    const item = await StockItem.findOne({ _id: req.params.id, farmId: req.user!.farmId });
    if (!item) {
      throw new AppError(404, "Stock item not found");
    }

    const previousEntry = await StockHistory.findOne({
      stockItemId: item._id,
      date: { $lt: payload.date },
    }).sort({ date: -1 });

    const openingQuantity = previousEntry ? previousEntry.remainingStock : item.quantity;
    const remainingStock = openingQuantity + payload.harvestedToday - payload.soldToday - payload.damaged;

    if (remainingStock < 0) {
      throw new AppError(400, "This entry would take stock below zero — check the harvested/sold/damaged numbers");
    }

    const entry = await StockHistory.findOneAndUpdate(
      { stockItemId: item._id, date: payload.date },
      {
        $set: {
          farmId: req.user!.farmId,
          stockItemId: item._id,
          date: payload.date,
          openingQuantity,
          harvestedToday: payload.harvestedToday,
          soldToday: payload.soldToday,
          damaged: payload.damaged,
          remainingStock,
          notes: payload.notes ?? null,
          recordedBy: req.user!.id,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    // Only advance the item's live quantity if this entry is the most recent
    // one on record — editing an older day's entry shouldn't overwrite today's.
    const latestEntry = await StockHistory.findOne({ stockItemId: item._id }).sort({ date: -1 });
    if (latestEntry && latestEntry.date === payload.date) {
      item.quantity = remainingStock;
      item.updatedBy = new mongoose.Types.ObjectId(req.user!.id);
      await item.save();
    }

    res.json({ historyEntry: entry!.toJSON(), stockItem: item.toJSON() });
  })
);

// DELETE /api/stock/:id — owner only
router.delete(
  "/:id",
  requireRole("owner"),
  asyncHandler(async (req, res) => {
    const item = await StockItem.findOneAndDelete({ _id: req.params.id, farmId: req.user!.farmId });
    if (!item) {
      throw new AppError(404, "Stock item not found");
    }
    res.status(204).send();
  })
);

export default router;
