import { Router } from "express";
import { z } from "zod";
import { Buyer } from "../models/Buyer";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireFarmScope, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireFarmScope);

const createBuyerSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
});

// GET /api/buyers?search= — picker list when recording a sale
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = { farmId: req.user!.farmId };
    if (typeof req.query.search === "string" && req.query.search.trim().length > 0) {
      const escaped = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = new RegExp(escaped, "i");
    }
    const buyers = await Buyer.find(filter).sort({ name: 1 });
    res.json({ buyers: buyers.map((b) => b.toJSON()) });
  })
);

// POST /api/buyers — created inline from the sale form the first time a
// buyer is used, same permission level as recording the sale itself.
router.post(
  "/",
  requireRole("owner", "supervisor", "labour"),
  asyncHandler(async (req, res) => {
    const payload = createBuyerSchema.parse(req.body);
    const buyer = await Buyer.create({ ...payload, farmId: req.user!.farmId });
    res.status(201).json({ buyer: buyer.toJSON() });
  })
);

// DELETE /api/buyers/:id — owner only
router.delete(
  "/:id",
  requireRole("owner"),
  asyncHandler(async (req, res) => {
    const buyer = await Buyer.findOneAndDelete({ _id: req.params.id, farmId: req.user!.farmId });
    if (!buyer) {
      throw new AppError(404, "Buyer not found");
    }
    res.status(204).send();
  })
);

export default router;
