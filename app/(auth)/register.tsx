import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, Sprout } from "lucide-react-native";
import { Screen, Text, Button, Input } from "@components/ui";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing, radii } from "@constants/theme";
import { useAuthStore } from "@services/state/authStore";
import { useRegister } from "@features/auth/hooks/useAuthMutations";
import { registerSchema, type RegisterForm } from "@features/auth/schemas";

export default function RegisterScreen() {
  const theme = useAppTheme();
  const [serverError, setServerError] = useState<string | null>(null);

  const register = useRegister();

  // New account creation lands with needsProfileCompletion=true, so the
  // redirect logic in app/index.tsx will send them to complete-profile
  // once the store flips to authenticated.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated]);

  const { control, handleSubmit } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await register.mutateAsync(values);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Couldn't create your account. Try again.");
    }
  });

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
        <ArrowLeft size={22} color={theme.textPrimary} />
      </Pressable>

      <View style={[styles.logoWrap, { backgroundColor: theme.primarySoft }]}>
        <Sprout size={36} color={theme.primary} />
      </View>

      <Text variant="display" align="center" style={styles.title}>
        Create your account
      </Text>
      <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
        Set up Farm Express for your farm in a couple of minutes.
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
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Input
              label="Confirm password"
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

        <Button
          label="Create account"
          onPress={onSubmit}
          loading={register.isPending}
          fullWidth
          style={styles.sendButton}
        />
      </View>

      <Pressable onPress={() => router.back()} style={styles.loginRow} hitSlop={8}>
        <Text variant="body" color="secondary">
          Already have an account? <Text variant="bodyStrong" color="brand">Sign in</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  backButton: { position: "absolute", top: spacing.lg, left: spacing.lg, width: 32 },
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
  loginRow: { alignSelf: "center", marginTop: spacing.lg, paddingVertical: spacing.sm },
});
