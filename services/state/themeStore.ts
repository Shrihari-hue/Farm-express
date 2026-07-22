import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorageAdapter } from "@services/storage/mmkv";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

/** User's chosen theme (Settings screen, Step onward). Persisted so the app
 * doesn't flash the wrong theme between launches. */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: "system",
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: "farm-express-theme",
      storage: createJSONStorage(() => mmkvStorageAdapter),
    },
  ),
);
