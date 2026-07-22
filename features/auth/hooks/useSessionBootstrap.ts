import { useEffect } from "react";
import { getCurrentSession, subscribeToAuthChanges } from "@services/supabase/authService";
import { fetchMyProfile } from "@services/supabase/profileService";
import { useAuthStore } from "@services/state/authStore";
import { logger } from "@utils/logger";

/**
 * Restores whatever session SecureStore has on cold start (fetching the
 * matching `public.users` profile row too, so `needsProfileCompletion` is
 * correct before the first render), then keeps both in sync for the rest of
 * the app's lifetime via `onAuthStateChange` — covering events the app
 * itself didn't initiate (token refresh, sign-out from another device,
 * session expiry).
 *
 * Call exactly once, from the root layout.
 */
export function useSessionBootstrap() {
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setHydrating = useAuthStore((s) => s.setHydrating);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  useEffect(() => {
    let isMounted = true;

    const loadSessionAndProfile = async () => {
      const session = await getCurrentSession();
      if (!isMounted) return;
      setSession(session);
      if (session) {
        const profile = await fetchMyProfile(session.user.id);
        if (isMounted) setProfile(profile);
      }
    };

    loadSessionAndProfile()
      .catch((error) => logger.error("Failed to restore session", error))
      .finally(() => {
        if (isMounted) setHydrating(false);
      });

    const unsubscribe = subscribeToAuthChanges((session) => {
      setSession(session);
      if (session) {
        fetchMyProfile(session.user.id)
          .then((profile) => {
            if (isMounted) setProfile(profile);
          })
          .catch((error) => logger.error("Failed to refresh profile after auth event", error));
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isHydrating };
}
