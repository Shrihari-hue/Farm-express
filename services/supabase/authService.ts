import type { Session } from "@supabase/supabase-js";
import { supabase } from "./client";
import { PHONE_COUNTRY_CODE } from "@constants/config";
import type { ProfileRow } from "./profileService";

/**
 * Thin, framework-free wrapper around `supabase.auth.*`. No React here —
 * `features/auth/hooks` wraps these in TanStack Query mutations and handles
 * navigation/toast side effects. Keeping this layer pure makes it easy to
 * unit test and reuse (e.g. from a future admin web dashboard).
 */

function toE164(phone: string): string {
  return phone.startsWith("+") ? phone : `${PHONE_COUNTRY_CODE}${phone}`;
}

export async function sendEmailOtp(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

export async function sendPhoneOtp(phone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    phone: toE164(phone),
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

export async function verifyEmailOtp(email: string, token: string): Promise<Session> {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) throw error;
  if (!data.session) throw new Error("Verification succeeded but no session was returned.");
  return data.session;
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<Session> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: toE164(phone),
    token,
    type: "sms",
  });
  if (error) throw error;
  if (!data.session) throw new Error("Verification succeeded but no session was returned.");
  return data.session;
}

/** Exchanges a Google ID token (obtained via `expo-auth-session`) for a
 * Supabase session. Requires the Google provider to be enabled in the
 * Supabase dashboard with matching client IDs. */
export async function signInWithGoogleIdToken(idToken: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });
  if (error) throw error;
  if (!data.session) throw new Error("Google sign-in succeeded but no session was returned.");
  return data.session;
}

/** Creates the caller's farm and links their `public.users` row to it, via
 * the `complete_owner_profile` Postgres function (database/functions.sql).
 * Self-registered users always become the `owner` of a brand-new farm;
 * supervisor/labour accounts are created via an invite flow instead, once
 * team management ships (Step 13), which will set their role explicitly. */
export async function completeProfile(params: { fullName: string; farmName: string }): Promise<ProfileRow> {
  const { data, error } = await supabase.rpc("complete_owner_profile", {
    p_full_name: params.fullName,
    p_farm_name: params.farmName,
  });
  if (error) throw error;
  if (!data) throw new Error("Profile completion succeeded but no profile was returned.");
  return data;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/** Subscribes to every auth event (sign-in, sign-out, token refresh) for
 * the lifetime of the app. Call once from the root layout. */
export function subscribeToAuthChanges(callback: (session: Session | null) => void): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => subscription.unsubscribe();
}
