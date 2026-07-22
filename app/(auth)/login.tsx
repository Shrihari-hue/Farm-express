import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Sprout } from "lucide-react-native";
import { Screen, Text, Button, Input } from "@components/ui";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing, radii } from "@constants/theme";
import { PHONE_COUNTRY_CODE } from "@constants/config";
import { useAuthStore } from "@services/state/authStore";
import { AuthMethodTabs } from "@features/auth/components/AuthMethodTabs";
import { GoogleSignInButton } from "@features/auth/components/GoogleSignInButton";
import { useGoogleAuth } from "@features/auth/hooks/useGoogleAuth";
import { useSendEmailOtp, useSendPhoneOtp } from "@features/auth/hooks/useAuthMutations";
import { emailLoginSchema, phoneLoginSchema } from "@features/auth/schemas";
import type { AuthMethod } from "@features/auth/types";

export default function LoginScreen() {
  const theme = useAppTheme();
  const [method, setMethod] = useState<AuthMethod>("phone");
  const [serverError, setServerError] = useState<string | null>(null);

  const sendEmailOtp = useSendEmailOtp();
  const sendPhoneOtp = useSendPhoneOtp();
  const googleAuth = useGoogleAuth();

  // Google sign-in resolves asynchronously in the background (browser tab
  // closes itself); once the store flips to authenticated, re-run the
  // redirect logic in app/index.tsx instead of navigating manually here.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated]);

  const emailForm = useForm({ resolver: zodResolver(emailLoginSchema), defaultValues: { email: "" } });
  const phoneForm = useForm({ resolver: zodResolver(phoneLoginSchema), defaultValues: { phone: "" } });

  const isSubmitting = sendEmailOtp.isPending || sendPhoneOtp.isPending;

  const onSubmitEmail = emailForm.handleSubmit(async ({ email }) => {
    setServerError(null);
    try {
      await sendEmailOtp.mutateAsync(email);
      router.push({ pathname: "/(auth)/verify-otp", params: { method: "email", identifier: email } });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Couldn't send the code. Try again.");
    }
  });

  const onSubmitPhone = phoneForm.handleSubmit(async ({ phone }) => {
    setServerError(null);
    try {
      await sendPhoneOtp.mutateAsync(phone);
      router.push({ pathname: "/(auth)/verify-otp", params: { method: "phone", identifier: phone } });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Couldn't send the code. Try again.");
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

      <AuthMethodTabs value={method} onChange={setMethod} />

      <View style={styles.form}>
        {method === "phone" ? (
          <Controller
            control={phoneForm.control}
            name="phone"
            render={({ field, fieldState }) => (
              <Input
                label="Mobile number"
                placeholder="98765 43210"
                keyboardType="number-pad"
                maxLength={10}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                leftIcon={<Text color="secondary">{PHONE_COUNTRY_CODE}</Text>}
              />
            )}
          />
        ) : (
          <Controller
            control={emailForm.control}
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
        )}

        {serverError ? (
          <Text variant="caption" color="danger" style={styles.serverError}>
            {serverError}
          </Text>
        ) : null}

        <Button
          label="Send code"
          onPress={method === "phone" ? onSubmitPhone : onSubmitEmail}
          loading={isSubmitting}
          fullWidth
          style={styles.sendButton}
        />
      </View>

      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        <Text variant="caption" color="secondary" style={styles.dividerLabel}>
          OR
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      </View>

      <GoogleSignInButton
        onPress={() => googleAuth.promptAsync()}
        loading={googleAuth.isLoading}
        disabled={!googleAuth.isReady}
      />

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
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: spacing.lg },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerLabel: { marginHorizontal: spacing.sm },
  terms: { marginTop: spacing.lg, paddingHorizontal: spacing.md },
});
