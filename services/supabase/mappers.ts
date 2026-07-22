import type { AppUser } from "@types/models";
import type { ProfileRow } from "./profileService";

/**
 * Maps a `public.users` row (see database/schema.sql) into the app's
 * `AppUser` domain model. This is the one place that would need to change
 * if the profile table's shape ever changes.
 */
export function mapProfileRowToAppUser(row: ProfileRow): AppUser {
  return {
    id: row.id,
    // Empty string, never null/undefined, while `needsProfileCompletion` is
    // true — no farm-scoped screen is reachable until that resolves, so
    // nothing ever queries against this sentinel value.
    farmId: row.farm_id ?? "",
    fullName: row.full_name,
    role: row.role,
    email: row.email,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}
