import { useEffect } from "react";
import { getMe } from "@services/api/authService";
import { clearToken, getToken } from "@services/api/tokenStorage";
import { useAuthStore } from "@services/state/authStore";
import { logger } from "@utils/logger";

/**
 * Restores whatever JWT SecureStore has on cold start and validates it
 * against `GET /api/auth/me`. If the token is missing there's nothing to
 * restore; if it's present but rejected (expired/invalid — a 401), it's
 * cleared and treated as signed out. There's no live "subscribe to auth
 * changes" equivalent for a custom JWT backend (that was Supabase-specific)
 * — just this one-time bootstrap call.
 *
 * Call exactly once, from the root layout.
 */
export function useSessionBootstrap() {
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrating = useAuthStore((s) => s.setHydrating);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const token = await getToken();
      if (!token) return;

      try {
        const user = await getMe();
        if (isMounted) setUser(user);
      } catch (error) {
        await clearToken();
        if (isMounted) setUser(null);
        logger.warn("Stored token was invalid/expired, signed out", error);
      }
    };

    bootstrap()
      .catch((error) => logger.error("Failed to restore session", error))
      .finally(() => {
        if (isMounted) setHydrating(false);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isHydrating };
}
