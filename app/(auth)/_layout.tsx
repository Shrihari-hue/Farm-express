import { Stack } from "expo-router";

/** Unauthenticated flow: sign-in, OTP verification, registration.
 * Full screens land in Step 3 (Authentication) — this group already
 * exists so that step is a pure content change, not a routing change. */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
