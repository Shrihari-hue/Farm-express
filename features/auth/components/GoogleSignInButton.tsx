import React from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing } from "@constants/theme";
import { Text } from "@components/ui";
import { GoogleLogo } from "./GoogleLogo";

interface Props {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GoogleSignInButton({ onPress, loading, disabled }: Props) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { borderColor: theme.border, backgroundColor: theme.surface, opacity: disabled ? 0.6 : 1 },
      ]}
      accessibilityRole="button"
    >
      {loading ? <ActivityIndicator /> : <GoogleLogo />}
      <Text variant="bodyStrong" style={styles.label}>
        Continue with Google
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  label: { marginLeft: spacing.xxs },
});
