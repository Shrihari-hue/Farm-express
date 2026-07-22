import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing } from "@constants/theme";
import { Text } from "./Text";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

interface Props {
  label: string;
  tone?: BadgeTone;
}

/** Small pill used for attendance status, payment status, stock category,
 * etc. Color-coded so scanning a list is fast at a glance. */
export function Badge({ label, tone = "neutral" }: Props) {
  const theme = useAppTheme();

  const toneStyles: Record<BadgeTone, { bg: string; fg: "success" | "warning" | "danger" | "brand" | "secondary" }> = {
    success: { bg: theme.mode === "dark" ? "#173629" : "#E1F2E6", fg: "success" },
    warning: { bg: theme.mode === "dark" ? "#3A2E10" : "#FBF0DA", fg: "warning" },
    danger: { bg: theme.mode === "dark" ? "#3A1917" : "#FBE7E6", fg: "danger" },
    info: { bg: theme.mode === "dark" ? "#152B3E" : "#E7F1FB", fg: "brand" },
    brand: { bg: theme.primarySoft, fg: "brand" },
    neutral: { bg: theme.border, fg: "secondary" },
  };

  const t = toneStyles[tone];

  return (
    <View style={[styles.base, { backgroundColor: t.bg }]}>
      <Text variant="label" color={t.fg}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.full,
  },
});
