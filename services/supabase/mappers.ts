import type { User } from "@supabase/supabase-js";
import { ROLES, type Role } from "@constants/config";
import type { AppUser } from "@types/models";

/**
 * Maps a raw Supabase auth user into the app's `AppUser` domain model.
 *
 * IMPORTANT (temporary, until Step 4 / Database ships): role, farm id and
 * full name are read from `user_metadata` rather than a `public.users`
 * table, because that table doesn't exist yet. Once Step 4 lands, swap
 * this for a query against `public.users` (joined on `auth.users.id`) and
 * delete the metadata fallback — every call site already goes through this
 * one function, so it's a one-file change.
 */
export function mapSupabaseUserToAppUser(user: User): AppUser {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

  return {
    id: user.id,
    farmId: (metadata.farmId as string) ?? user.id,
    fullName: (metadata.fullName as string) ?? "",
    role: (metadata.role as Role) ?? ROLES.OWNER,
    email: user.email ?? null,
    phone: user.phone ?? null,
    avatarUrl: (metadata.avatarUrl as string) ?? null,
    isActive: true,
    createdAt: user.created_at,
  };
}

/** A freshly-verified user has no `fullName`/`farmName` yet — they're sent
 * to the "complete profile" screen before entering the app. */
export function isProfileComplete(user: User): boolean {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  return Boolean(metadata.fullName) && Boolean(metadata.farmName);
}
