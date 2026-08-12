import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { signAccessToken } from "../utils/jwt";
import { requireAuth } from "../middleware/auth";

const router = Router();

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const SALT_ROUNDS = 10;

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password } = credentialsSchema.parse(req.body);

    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      email,
      passwordHash,
      role: "owner",
      farmId: null,
      fullName: "",
      isActive: true,
    });

    const token = signAccessToken(user._id.toString());
    res.status(201).json({ token, user: user.toJSON() });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = credentialsSchema.parse(req.body);

    // Explicitly select passwordHash since the schema hides it by default.
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new AppError(401, "Invalid email or password");
    }
    if (!user.isActive) {
      throw new AppError(403, "This account has been deactivated");
    }

    const token = signAccessToken(user._id.toString());
    res.json({ token, user: user.toJSON() });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.id);
    if (!user) {
      throw new AppError(401, "User no longer exists");
    }
    res.json({ user: user.toJSON() });
  })
);

export default router;
