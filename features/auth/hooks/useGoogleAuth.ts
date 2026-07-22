import { useEffect } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useMutation } from "@tanstack/react-query";
import { ENV } from "@constants/config";
import { signInWithGoogleIdToken } from "@services/supabase/authService";
import { fetchMyProfile } from "@services/supabase/profileService";
import { useAuthStore } from "@services/state/authStore";
import { logger } from "@utils/logger";

// Required once per app so the auth session's browser tab/modal closes
// itself and hands control back to the app after Google redirects.
WebBrowser.maybeCompleteAuthSession();

/**
 * Wraps `expo-auth-session`'s Google ID-token flow + the Supabase exchange
 * into a single `{ promptAsync, isReady, isLoading }` API for screens.
 *
 * Requires EXPO_PUBLIC_GOOGLE_{IOS,ANDROID,WEB}_CLIENT_ID in `.env` (see
 * `.env.example`) and the Google provider enabled in the Supabase dashboard
 * with the same client IDs.
 */
export function useGoogleAuth() {
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: ENV.googleIosClientId || undefined,
    androidClientId: ENV.googleAndroidClientId || undefined,
    webClientId: ENV.googleWebClientId || undefined,
  });

  const exchangeMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const session = await signInWithGoogleIdToken(idToken);
      setSession(session);
      const profile = await fetchMyProfile(session.user.id);
      setProfile(profile);
      return session;
    },
    onError: (error) => logger.error("Google sign-in exchange failed", error),
  });

  useEffect(() => {
    if (response?.type === "success" && response.params.id_token) {
      exchangeMutation.mutate(response.params.id_token);
    } else if (response?.type === "error") {
      logger.error("Google auth session failed", response.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return {
    promptAsync,
    isReady: !!request,
    isLoading: exchangeMutation.isPending,
    error: exchangeMutation.error,
  };
}
