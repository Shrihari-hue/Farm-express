import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import type { AppUser } from "@types/models";
import { mapProfileRowToAppUser } from "@services/supabase/mappers";
import type { ProfileRow } from "@services/supabase/profileService";

interface AuthState {
  session: Session | null;
  /** Raw `public.users` row — see `services/supabase/profileService.ts`. */
  profile: ProfileRow | null;
  /** Derived, app-shaped view of `profile`. Null until `profile` loads. */
  user: AppUser | null;
  isHydrating: boolean;
  isAuthenticated: boolean;
  /** True once a session exists but `profile.farm_id` is still null —
   * i.e. they've verified an OTP but haven't named their farm yet. */
  needsProfileCompletion: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: ProfileRow | null) => void;
  setHydrating: (value: boolean) => void;
  signOutLocal: () => void;
}

/**
 * Holds the current session + profile in memory for fast, synchronous reads
 * (role checks in navigation guards, etc). Kept intentionally "dumb" —
 * fetching the profile row after a session appears is orchestrated by
 * `features/auth/hooks/useSessionBootstrap.ts` and the auth mutations, not
 * by this store, so async flow stays visible and testable at the call site.
 */
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  user: null,
  isHydrating: true,
  isAuthenticated: false,
  needsProfileCompletion: false,
  setSession: (session) =>
    set((state) => ({
      session,
      isAuthenticated: !!session,
      // A session refresh (same user) keeps whatever profile we already
      // have; a real sign-out clears it. Callers fetch a fresh profile
      // after sign-in events themselves (see useSessionBootstrap).
      profile: session ? state.profile : null,
      user: session ? state.user : null,
      needsProfileCompletion: session ? state.needsProfileCompletion : false,
    })),
  setProfile: (profile) =>
    set({
      profile,
      user: profile ? mapProfileRowToAppUser(profile) : null,
      needsProfileCompletion: !!profile && profile.farm_id === null,
    }),
  setHydrating: (value) => set({ isHydrating: value }),
  signOutLocal: () =>
    set({
      session: null,
      profile: null,
      user: null,
      isAuthenticated: false,
      needsProfileCompletion: false,
    }),
}));
