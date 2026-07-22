import { useEffect } from "react";
import { getCurrentSession, subscribeToAuthChanges } from "@services/supabase/authService";
import { useAuthStore } from "@services/state/authStore";
import { logger } from "@utils/logger";

/**
 * Restores whatever session SecureStore has on cold start, then keeps the
 * auth store in sync for the rest of the app's lifetime (sign-in, sign-out,
 * token refresh all flow through the same `onAuthStateChange` listener).
 *
 * Call exactly once, from the root layout.
 */
export function useSessionBootstrap() {
  const setSession = useAuthStore((s) => s.setSession);
  const setHydrating = useAuthStore((s) => s.setHydrating);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  useEffect(() => {
    let isMounted = true;

    getCurrentSession()
      .then((session) => {
        if (!isMounted) return;
        setSession(session);
      })
      .catch((error) => {
        logger.error("Failed to restore session", error);
      })
      .finally(() => {
        if (isMounted) setHydrating(false);
      });

    const unsubscribe = subscribeToAuthChanges((session) => {
      setSession(session);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isHydrating };
}
