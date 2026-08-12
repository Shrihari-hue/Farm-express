import { Stack } from "expo-router";

/** Unauthenticated flow: sign in or register with email+password ->
 * complete profile on first sign-in -> redirected into `(app)`. */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="complete-profile" />
    </Stack>
  );
}
