import { useMutation } from "@tanstack/react-query";
import * as authService from "@services/api/authService";
import { clearToken } from "@services/api/tokenStorage";
import { useAuthStore } from "@services/state/authStore";
import { logger } from "@utils/logger";

/** Registers a brand-new email+password account, persists the token, and
 * hydrates the store — new users always land with `needsProfileCompletion`
 * true (fresh `farmId: null`), so callers can navigate immediately. */
export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (params: { email: string; password: string }) =>
      authService.register(params.email, params.password),
    onSuccess: ({ user }) => setUser(user),
    onError: (error) => logger.error("register failed", error),
  });
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (params: { email: string; password: string }) => authService.login(params.email, params.password),
    onSuccess: ({ user }) => setUser(user),
    onError: (error) => logger.error("login failed", error),
  });
}

export function useCompleteProfile() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (params: { fullName: string; farmName: string }) => authService.completeProfile(params),
    onSuccess: (user) => setUser(user),
    onError: (error) => logger.error("completeProfile failed", error),
  });
}

export function useSignOut() {
  const signOutLocal = useAuthStore((s) => s.signOutLocal);

  return useMutation({
    mutationFn: async () => {
      await clearToken();
    },
    onSuccess: () => signOutLocal(),
    onError: (error) => logger.error("signOut failed", error),
  });
}
