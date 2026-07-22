import { useMutation } from "@tanstack/react-query";
import * as authService from "@services/supabase/authService";
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

/** Verifies the 6-digit code and, on success, hydrates the auth store —
 * `app/index.tsx` reacts to `isAuthenticated`/`needsProfileCompletion`
 * changing and redirects automatically, so callers just need to await
 * this and let navigation happen on its own. */
export function useVerifyOtp() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (params: { method: "email" | "phone"; identifier: string; otp: string }) => {
      const session =
        params.method === "email"
          ? await authService.verifyEmailOtp(params.identifier, params.otp)
          : await authService.verifyPhoneOtp(params.identifier, params.otp);
      return session;
    },
    onSuccess: (session) => setSession(session),
    onError: (error) => logger.error("verifyOtp failed", error),
  });
}

export function useCompleteProfile() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (params: { fullName: string; farmName: string }) =>
      authService.completeProfile(params),
    onSuccess: (session) => setSession(session),
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
