import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { Sale } from "../models/Sale";
import { StockItem } from "../models/StockItem";
import { Buyer } from "../models/Buyer";
import { ActivityLog } from "../models/ActivityLog";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireFarmScope, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireFarmScope);

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format");

const createSaleSchema = z.object({
  stockItemId: z.string().min(1),
  buyerId: z.string().min(1),
  quantity: z.number().min(0.01),
  rate: z.number().min(0),
  transportCost: z.number().min(0).default(0),
  commission: z.number().min(0).default(0),
  paymentMethod: z.enum(["cash", "upi", "bank", "credit"]),
  date: dateStringSchema,
  remarks: z.string().nullable().optional(),
});

// GET /api/sales?startDate=&endDate=
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const startDate = dateStringSchema.parse(req.query.startDate);
    const endDate = dateStringSchema.parse(req.query.endDate);
    const rows = await Sale.find({
      farmId: req.user!.farmId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1, createdAt: -1 });
    res.json({ sales: rows.map((r) => r.toJSON()) });
  })
);

// GET /api/sales/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const sale = await Sale.findOne({ _id: req.params.id, farmId: req.user!.farmId });
    if (!sale) {
      throw new AppError(404, "Sale not found");
    }
    res.json({ sale: sale.toJSON() });
  })
);

// POST /api/sales — deducts the sold quantity from the stock item's live
// balance. Amount/netAmount are always server-computed from quantity/rate/
// transportCost/commission, never trusted from the client.
router.post(
  "/",
  requireRole("owner", "supervisor", "labour"),
  asyncHandler(async (req, res) => {
    const payload = createSaleSchema.parse(req.body);

    const [stockItem, buyer] = await Promise.all([
      StockItem.findOne({ _id: payload.stockItemId, farmId: req.user!.farmId }),
      Buyer.findOne({ _id: payload.buyerId, farmId: req.user!.farmId }),
    ]);
    if (!stockItem) {
      throw new AppError(404, "Stock item not found");
    }
    if (!buyer) {
      throw new AppError(404, "Buyer not found");
    }
    if (stockItem.quantity < payload.quantity) {
      throw new AppError(400, `Not enough stock — only ${stockItem.quantity} ${stockItem.unit} available`);
    }

    const amount = payload.quantity * payload.rate;
    const netAmount = amount - payload.transportCost - payload.commission;
    if (netAmount < 0) {
      throw new AppError(400, "Transport cost + commission can't exceed the sale amount");
    }

    const sale = await Sale.create({
      farmId: req.user!.farmId,
      stockItemId: payload.stockItemId,
      buyerId: payload.buyerId,
      quantity: payload.quantity,
      rate: payload.rate,
      amount,
      transportCost: payload.transportCost,
      commission: payload.commission,
      netAmount,
      paymentMethod: payload.paymentMethod,
      date: payload.date,
      remarks: payload.remarks ?? null,
      recordedBy: req.user!.id,
    });

    stockItem.quantity -= payload.quantity;
    stockItem.updatedBy = new mongoose.Types.ObjectId(req.user!.id);
    await stockItem.save();

    await ActivityLog.create({
      farmId: req.user!.farmId,
      userId: req.user!.id,
      action: "sale_recorded",
      entityType: "sale",
      entityId: sale._id.toString(),
      metadata: { stockItemName: stockItem.name, quantity: payload.quantity, netAmount },
    });

    res.status(201).json({ sale: sale.toJSON(), stockItem: stockItem.toJSON() });
  })
);

// DELETE /api/sales/:id — owner only. Restores the sold quantity back onto
// the stock item, since deleting a sale should undo its stock effect.
router.delete(
  "/:id",
  requireRole("owner"),
  asyncHandler(async (req, res) => {
    const sale = await Sale.findOneAndDelete({ _id: req.params.id, farmId: req.user!.farmId });
    if (!sale) {
      throw new AppError(404, "Sale not found");
    }
    await StockItem.updateOne({ _id: sale.stockItemId }, { $inc: { quantity: sale.quantity } });
    res.status(204).send();
  })
);

export default router;
