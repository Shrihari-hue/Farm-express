import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";
import { ENV } from "@constants/config";
import { secureStorageAdapter } from "@services/storage/secureStore";
import type { Database } from "./database.types";

if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) {
  // Intentionally a warning, not a throw — lets the app boot far enough to
  // show a friendly "not configured" screen instead of a white crash screen.
  // eslint-disable-next-line no-console
  console.warn(
    "[FarmExpress] Supabase env vars are missing. Copy .env.example to .env and fill in your project credentials.",
  );
}

/**
 * Single Supabase client for the whole app. Session tokens are persisted in
 * SecureStore (Keychain/Keystore) rather than AsyncStorage so they're
 * encrypted at rest, satisfying the "secure authentication" requirement.
 */
export const supabase = createClient<Database>(ENV.supabaseUrl, ENV.supabaseAnonKey, {
  auth: {
    storage: secureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Supabase's auto-refresh only runs while something calls `startAutoRefresh`.
 * Tying it to AppState means we stop polling for a refreshed token while the
 * app is backgrounded (saves battery) and resume the moment it's foregrounded.
 */
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    void supabase.auth.startAutoRefresh();
  } else {
    void supabase.auth.stopAutoRefresh();
  }
});
