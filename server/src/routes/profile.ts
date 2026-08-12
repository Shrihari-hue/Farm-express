import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { Farm } from "../models/Farm";
import { User } from "../models/User";
import { ActivityLog } from "../models/ActivityLog";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";

const router = Router();

const completeProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  farmName: z.string().trim().min(1, "Farm name is required"),
});

/**
 * Replaces the `complete_owner_profile` Postgres RPC. Atomically:
 *   1. creates a Farm document owned by the caller,
 *   2. updates the User document (fullName, farmId, role=owner),
 *   3. writes a `farm_created` ActivityLog entry.
 * Requires a MongoDB replica set (Atlas provisions one even on the M0 free tier).
 */
router.post(
  "/complete",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { fullName, farmName } = completeProfileSchema.parse(req.body);

    const session = await mongoose.startSession();
    try {
      let updatedUser: InstanceType<typeof User> | null = null;

      await session.withTransaction(async () => {
        const [farm] = await Farm.create(
          [
            {
              name: farmName,
              ownerId: req.user!.id,
              currency: "INR",
              language: "en",
            },
          ],
          { session }
        );

        updatedUser = await User.findByIdAndUpdate(
          req.user!.id,
          { fullName, farmId: farm._id, role: "owner" },
          { new: true, session }
        );

        if (!updatedUser) {
          throw new AppError(401, "User no longer exists");
        }

        await ActivityLog.create(
          [
            {
              farmId: farm._id,
              userId: req.user!.id,
              action: "farm_created",
              entityType: "farm",
              entityId: farm._id.toString(),
            },
          ],
          { session }
        );
      });

      if (!updatedUser) {
        throw new AppError(500, "Failed to complete profile");
      }

      res.json({ user: (updatedUser as InstanceType<typeof User>).toJSON() });
    } finally {
      await session.endSession();
    }
  })
);

export default router;
