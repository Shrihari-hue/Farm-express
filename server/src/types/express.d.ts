import type { UserRole } from "../models/User";

/**
 * Shape attached to `req.user` by the `requireAuth` middleware (see
 * middleware/auth.ts). Mirrors the fields every route handler needs to
 * enforce farm-scoping and role checks that used to be Postgres RLS policies.
 */
export interface AuthenticatedUser {
  id: string;
  farmId: string | null;
  role: UserRole;
  email: string;
  fullName: string;
  isActive: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
