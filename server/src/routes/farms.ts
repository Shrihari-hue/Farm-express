import { Router } from "express";
import { Farm } from "../models/Farm";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/farms/:id — must be either the caller's own farm or they must be the owner
router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      throw new AppError(404, "Farm not found");
    }

    const isOwnFarm = req.user!.farmId === farm._id.toString();
    const isOwner = farm.ownerId.toString() === req.user!.id;
    if (!isOwnFarm && !isOwner) {
      throw new AppError(403, "You do not have access to this farm");
    }

    res.json({ farm: farm.toJSON() });
  })
);

export default router;
