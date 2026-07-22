import { useMutation } from "@tanstack/react-query";
import * as authService from "@services/supabase/authService";
import { fetchMyProfile } from "@services/supabase/profileService";
import { useAuthStore } from "@services/state/authStore";
import { logger } from "@utils/logger";

/** Sends a one-time code to an email address (new or existing user). */
export function useSendEmailOtp() {
  return useMutation({
    mutationFn: (email: string) => authService.sendEmailOtp(email),
    onError: (error) => logger.error("sendEmailOtp failed", error),
  });
}

/** Sends a one-time code via SMS to a 10-digit Indian mobile number. */
export function useSendPhoneOtp() {
  return useMutation({
    mutationFn: (phone: string) => authService.sendPhoneOtp(phone),
    onError: (error) => logger.error("sendPhoneOtp failed", error),
  });
}

/**
 * Verifies the 6-digit code, hydrates the session, and loads the caller's
 * `public.users` row so `needsProfileCompletion` is correct by the time this
 * resolves — callers can safely navigate immediately after `await`ing it
 * instead of waiting on the background `onAuthStateChange` listener.
 */
export function useVerifyOtp() {
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);

  return useMutation({
    mutationFn: async (params: { method: "email" | "phone"; identifier: string; otp: string }) => {
      const session =
        params.method === "email"
          ? await authService.verifyEmailOtp(params.identifier, params.otp)
          : await authService.verifyPhoneOtp(params.identifier, params.otp);
      setSession(session);
      const profile = await fetchMyProfile(session.user.id);
      setProfile(profile);
      return session;
    },
    onError: (error) => logger.error("verifyOtp failed", error),
  });
}

export function useCompleteProfile() {
  const setProfile = useAuthStore((s) => s.setProfile);

  return useMutation({
    mutationFn: (params: { fullName: string; farmName: string }) =>
      authService.completeProfile(params),
    onSuccess: (profile) => setProfile(profile),
    onError: (error) => logger.error("completeProfile failed", error),
  });
}

export function useSignOut() {
  const signOutLocal = useAuthStore((s) => s.signOutLocal);

  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => signOutLocal(),
    onError: (error) => logger.error("signOut failed", error),
  });
}
