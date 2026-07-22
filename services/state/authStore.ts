import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import type { AppUser } from "@types/models";
import { isProfileComplete, mapSupabaseUserToAppUser } from "@services/supabase/mappers";

interface AuthState {
  session: Session | null;
  user: AppUser | null;
  isHydrating: boolean;
  isAuthenticated: boolean;
  /** True once a session exists but the user hasn't set their name/farm yet. */
  needsProfileCompletion: boolean;
  setSession: (session: Session | null) => void;
  setHydrating: (value: boolean) => void;
  signOutLocal: () => void;
}

/**
 * Holds the *current session's* user profile in memory for fast, synchronous
 * reads (role checks in navigation guards, etc). The source of truth is
 * still the Supabase session — `setSession` is called from
 * `services/supabase/authService.ts`'s `onAuthStateChange` listener (wired
 * up once in the root layout), never from screens directly.
 */
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isHydrating: true,
  isAuthenticated: false,
  needsProfileCompletion: false,
  setSession: (session) =>
    set({
      session,
      user: session ? mapSupabaseUserToAppUser(session.user) : null,
      isAuthenticated: !!session,
      needsProfileCompletion: session ? !isProfileComplete(session.user) : false,
    }),
  setHydrating: (value) => set({ isHydrating: value }),
  signOutLocal: () =>
    set({ session: null, user: null, isAuthenticated: false, needsProfileCompletion: false }),
}));
