import { create } from "zustand";
import type { AppUser } from "@types/models";

interface AuthState {
  user: AppUser | null;
  isHydrating: boolean;
  isAuthenticated: boolean;
  setUser: (user: AppUser | null) => void;
  setHydrating: (value: boolean) => void;
  signOutLocal: () => void;
}

/**
 * Holds the *current session's* user profile in memory for fast, synchronous
 * reads (role checks in navigation guards, etc). The source of truth is
 * still the Supabase session — this store is populated from it in
 * `features/auth` and cleared on sign-out. Nothing here is persisted
 * directly; the Supabase SDK already persists the session in SecureStore.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrating: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setHydrating: (value) => set({ isHydrating: value }),
  signOutLocal: () => set({ user: null, isAuthenticated: false }),
}));
