import { Redirect } from "expo-router";
import { useAuthStore } from "@services/state/authStore";

/**
 * Entry route — three possible destinations based on session state:
 *  - no session            -> sign-in
 *  - session, incomplete   -> complete-profile (first sign-in only)
 *  - session, complete     -> the authenticated app
 */
export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const needsProfileCompletion = useAuthStore((s) => s.needsProfileCompletion);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (needsProfileCompletion) {
    return <Redirect href="/(auth)/complete-profile" />;
  }

  return <Redirect href="/(app)/dashboard" />;
}
