import { supabase } from "./client";
import type { Database } from "./database.types";

export type ProfileRow = Database["public"]["Tables"]["users"]["Row"];

/**
 * Fetches the caller's own `public.users` row — the row created
 * automatically by the `handle_new_user` trigger the instant they verify
 * their first OTP (see database/functions.sql). `farm_id` is `null` until
 * `complete_owner_profile` runs, which is exactly the signal
 * `services/state/authStore.ts` uses for `needsProfileCompletion`.
 */
export async function fetchMyProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
