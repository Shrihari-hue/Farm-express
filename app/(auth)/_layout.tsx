import { Stack } from "expo-router";

/** Unauthenticated flow: enter email/phone -> verify OTP (or Google) ->
 * complete profile on first sign-in -> redirected into `(app)`. */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="complete-profile" />
    </Stack>
  );
}
