import React from "react";
import { Pressable, StyleSheet, View, type ViewProps } from "react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing, shadows } from "@constants/theme";

interface Props extends ViewProps {
  onPress?: () => void;
  elevated?: boolean;
  children: React.ReactNode;
}

/** Rounded, softly-shadowed surface used for every dashboard tile, list row
 * grouping, and form section — the primary visual building block of the
 * "premium" look requested in the design brief. */
export function Card({ onPress, elevated = true, style, children, ...rest }: Props) {
  const theme = useAppTheme();
  const content = (
    <View
      style={[
        styles.base,
        { backgroundColor: theme.card, borderColor: theme.border },
        elevated && shadows.sm,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
});
