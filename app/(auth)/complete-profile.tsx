import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CircleUser } from "lucide-react-native";
import { Screen, Text, Button, Input } from "@components/ui";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing, radii } from "@constants/theme";
import { useCompleteProfile } from "@features/auth/hooks/useAuthMutations";
import { completeProfileSchema } from "@features/auth/schemas";

/**
 * Shown once, right after a brand-new user verifies their first OTP.
 * Collects the two things Supabase Auth doesn't ask for: the owner's name
 * and their farm's name. Submitting flips `needsProfileCompletion` to
 * false in the auth store, and `app/index.tsx` redirects to the dashboard.
 */
export default function CompleteProfileScreen() {
  const theme = useAppTheme();
  const completeProfile = useCompleteProfile();

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { fullName: "", farmName: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await completeProfile.mutateAsync(values);
      router.replace("/");
    } catch {
      // Error is already captured in `completeProfile.error` and rendered below.
    }
  });

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
        <CircleUser size={32} color={theme.primary} />
      </View>

      <Text variant="title" align="center" style={styles.title}>
        Tell us about your farm
      </Text>
      <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
        This sets up your account as the farm owner. You can invite supervisors and labour later
        from Settings.
      </Text>

      <View style={styles.form}>
        <Controller
          control={control}
          name="fullName"
          render={({ field, fieldState }) => (
            <Input
              label="Your full name"
              placeholder="e.g. Ramesh Gowda"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="farmName"
          render={({ field, fieldState }) => (
            <Input
              label="Farm name"
              placeholder="e.g. Green Valley Farm"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        {completeProfile.isError ? (
          <Text variant="caption" color="danger">
            {completeProfile.error instanceof Error
              ? completeProfile.error.message
              : "Something went wrong. Try again."}
          </Text>
        ) : null}

        <Button
          label="Get started"
          onPress={onSubmit}
          loading={formState.isSubmitting || completeProfile.isPending}
          fullWidth
          style={styles.submitButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: spacing.lg },
  iconWrap: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.lg, paddingHorizontal: spacing.sm },
  form: { gap: spacing.sm },
  submitButton: { marginTop: spacing.xs },
});
