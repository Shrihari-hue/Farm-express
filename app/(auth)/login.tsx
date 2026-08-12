import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Sprout } from "lucide-react-native";
import { Screen, Text, Button, Input } from "@components/ui";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing, radii } from "@constants/theme";
import { useAuthStore } from "@services/state/authStore";
import { useLogin } from "@features/auth/hooks/useAuthMutations";
import { credentialsSchema, type CredentialsForm } from "@features/auth/schemas";

export default function LoginScreen() {
  const theme = useAppTheme();
  const [serverError, setServerError] = useState<string | null>(null);

  const login = useLogin();

  // Re-run the redirect logic in app/index.tsx once the store flips to
  // authenticated, instead of navigating manually here.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated]);

  const { control, handleSubmit } = useForm<CredentialsForm>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login.mutateAsync(values);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Couldn't sign in. Try again.");
    }
  });

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <View style={[styles.logoWrap, { backgroundColor: theme.primarySoft }]}>
        <Sprout size={36} color={theme.primary} />
      </View>

      <Text variant="display" align="center" style={styles.title}>
        Farm Express
      </Text>
      <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
        Manage labour, attendance, salary, stock and sales — all in one place.
      </Text>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Input
              label="Email address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        {serverError ? (
          <Text variant="caption" color="danger" style={styles.serverError}>
            {serverError}
          </Text>
        ) : null}

        <Button label="Sign in" onPress={onSubmit} loading={login.isPending} fullWidth style={styles.sendButton} />
      </View>

      <Pressable onPress={() => router.push("/(auth)/register")} style={styles.registerRow} hitSlop={8}>
        <Text variant="body" color="secondary">
          Don&apos;t have an account? <Text variant="bodyStrong" color="brand">Sign up</Text>
        </Text>
      </Pressable>

      <Text variant="caption" color="secondary" align="center" style={styles.terms}>
        By continuing you agree to Farm Express's Terms of Service and Privacy Policy.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  logoWrap: {
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: { marginBottom: spacing.xxs },
  subtitle: { marginBottom: spacing.lg, paddingHorizontal: spacing.md },
  form: { gap: spacing.sm, marginTop: spacing.md },
  serverError: { marginTop: -spacing.xxs },
  sendButton: { marginTop: spacing.xxs },
  registerRow: { alignSelf: "center", marginTop: spacing.lg, paddingVertical: spacing.sm },
  terms: { marginTop: spacing.lg, paddingHorizontal: spacing.md },
});
