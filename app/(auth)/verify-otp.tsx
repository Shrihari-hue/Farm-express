import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Screen, Text, Button } from "@components/ui";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing } from "@constants/theme";
import { PHONE_COUNTRY_CODE, OTP_LENGTH } from "@constants/config";
import { OtpInputField } from "@features/auth/components/OtpInputField";
import { useResendTimer } from "@features/auth/hooks/useResendTimer";
import { useSendEmailOtp, useSendPhoneOtp, useVerifyOtp } from "@features/auth/hooks/useAuthMutations";
import type { AuthMethod } from "@features/auth/types";

export default function VerifyOtpScreen() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ method: AuthMethod; identifier: string }>();
  const method = params.method === "email" ? "email" : "phone";
  const identifier = params.identifier ?? "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const verifyOtp = useVerifyOtp();
  const sendEmailOtp = useSendEmailOtp();
  const sendPhoneOtp = useSendPhoneOtp();
  const { secondsLeft, canResend, restart } = useResendTimer();

  const destinationLabel = method === "phone" ? `${PHONE_COUNTRY_CODE} ${identifier}` : identifier;

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code`);
      return;
    }
    setError(null);
    try {
      await verifyOtp.mutateAsync({ method, identifier, otp });
      // Re-evaluate app/index.tsx now that the auth store has a session —
      // it decides between complete-profile and the dashboard.
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code. Try again.");
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError(null);
    try {
      if (method === "email") {
        await sendEmailOtp.mutateAsync(identifier);
      } else {
        await sendPhoneOtp.mutateAsync(identifier);
      }
      restart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't resend the code. Try again.");
    }
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
        <ArrowLeft size={22} color={theme.textPrimary} />
      </Pressable>

      <Text variant="title" style={styles.title}>
        Enter verification code
      </Text>
      <Text variant="body" color="secondary" style={styles.subtitle}>
        We've sent a {OTP_LENGTH}-digit code to {destinationLabel}
      </Text>

      <View style={styles.otpWrap}>
        <OtpInputField
          value={otp}
          onChange={(value) => {
            setOtp(value);
            if (error) setError(null);
          }}
          error={error ?? undefined}
        />
      </View>

      <Button
        label="Verify & Continue"
        onPress={handleVerify}
        loading={verifyOtp.isPending}
        fullWidth
        style={styles.verifyButton}
      />

      <Pressable
        onPress={handleResend}
        disabled={!canResend || sendEmailOtp.isPending || sendPhoneOtp.isPending}
        style={styles.resendRow}
      >
        <Text variant="body" color={canResend ? "brand" : "secondary"}>
          {canResend ? "Resend code" : `Resend code in ${secondsLeft}s`}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.md },
  backButton: { marginBottom: spacing.lg, width: 32 },
  title: { marginBottom: spacing.xxs },
  subtitle: { marginBottom: spacing.xl },
  otpWrap: { marginBottom: spacing.lg },
  verifyButton: { marginBottom: spacing.md },
  resendRow: { alignSelf: "center", paddingVertical: spacing.sm },
});
