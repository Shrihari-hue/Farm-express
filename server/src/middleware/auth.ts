import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/jwt";
import { User, type UserRole } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * Reads `Authorization: Bearer <token>`, verifies the JWT, loads the User
 * document by id, and attaches `req.user`. This is the direct replacement for
 * Supabase's `auth.uid()` + the `current_farm_id()`/`current_role()` SQL helper
 * functions — every protected route now reads farm/role off `req.user` instead
 * of relying on Postgres RLS.
 */
export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.header("authorization") || req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError(401, "Missing or invalid Authorization header");
  }
  const token = header.slice("Bearer ".length).trim();

  let payload: { sub: string };
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new AppError(401, "User no longer exists");
  }
  if (!user.isActive) {
    throw new AppError(403, "This account has been deactivated");
  }

  req.user = {
    id: user._id.toString(),
    farmId: user.farmId ? user.farmId.toString() : null,
    role: user.role,
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
  };

  next();
});

/**
 * 403s unless `req.user.role` is one of `roles`. Mirrors the
 * `current_role() in (...)` checks in the audit's RLS INSERT/UPDATE/DELETE
 * policies (section 2): owner+supervisor can write, owner-only can delete.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, "Not authenticated"));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, "You do not have permission to perform this action"));
      return;
    }
    next();
  };
}

/**
 * Every protected route except register/login/me/complete-profile must filter
 * by `req.user.farmId`. This guard 403s if the caller hasn't completed their
 * profile yet (farmId still null).
 */
export function requireFarmScope(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError(401, "Not authenticated"));
    return;
  }
  if (!req.user.farmId) {
    next(new AppError(403, "Complete your farm profile before accessing this resource"));
    return;
  }
  next();
}
