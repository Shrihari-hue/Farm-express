import { Redirect } from "expo-router";
import { useAuthStore } from "@services/state/authStore";

/**
 * Entry route — routes to the authenticated app or the sign-in flow based
 * on session state. Real session restoration lands in Step 3; for now
 * `isAuthenticated` simply defaults to false so the app boots into `(auth)`.
 */
export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return <Redirect href={isAuthenticated ? "/(app)/dashboard" : "/(auth)/login"} />;
}
