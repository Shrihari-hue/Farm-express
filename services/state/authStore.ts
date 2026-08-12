import { create } from "zustand";
import type { AppUser } from "@app-types/models";

interface AuthState {
  user: AppUser | null;
  isHydrating: boolean;
  isAuthenticated: boolean;
  /** True once a user exists but hasn't completed farm setup yet —
   * i.e. they've registered/logged in but `farmId` is still null/empty. */
  needsProfileCompletion: boolean;
  setUser: (user: AppUser | null) => void;
  setHydrating: (value: boolean) => void;
  signOutLocal: () => void;
}

/**
 * Holds the current user in memory for fast, synchronous reads (role checks
 * in navigation guards, etc). With the new JWT backend, identity and
 * profile are the same document — there's no separate "session" vs.
 * "profile row" split like there was with Supabase Auth + `public.users`.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrating: true,
  isAuthenticated: false,
  needsProfileCompletion: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      needsProfileCompletion: !!user && (!user.farmId || user.farmId === ""),
    }),
  setHydrating: (value) => set({ isHydrating: value }),
  signOutLocal: () =>
    set({
      user: null,
      isAuthenticated: false,
      needsProfileCompletion: false,
    }),
}));
