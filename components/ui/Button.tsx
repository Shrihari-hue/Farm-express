import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing, animation } from "@constants/theme";
import { Text } from "./Text";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface Props {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  testID?: string;
  /** Extra layout styling (margins, etc.) — visual variants should stay
   * driven by `variant`/`size`, not ad-hoc overrides here. */
  style?: StyleProp<ViewStyle>;
}

const SIZE_MAP: Record<ButtonSize, { paddingVertical: number; fontSize: "sm" | "md" | "lg" }> = {
  sm: { paddingVertical: spacing.xs, fontSize: "sm" },
  md: { paddingVertical: spacing.sm, fontSize: "md" },
  lg: { paddingVertical: spacing.md, fontSize: "lg" },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Primary interactive control across the app. Large touch targets (min 44pt
 * height per size) and a subtle press-scale animation for a "premium" feel. */
export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  testID,
  style,
}: Props) {
  const theme = useAppTheme();
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const variantStyles: Record<ButtonVariant, { backgroundColor: string; borderColor?: string; textColor: "inverse" | "primary" | "brand" | "danger" }> = {
    primary: { backgroundColor: theme.primary, textColor: "inverse" },
    secondary: { backgroundColor: theme.primarySoft, textColor: "brand" },
    outline: { backgroundColor: "transparent", borderColor: theme.primary, textColor: "brand" },
    ghost: { backgroundColor: "transparent", textColor: "brand" },
    danger: { backgroundColor: theme.danger, textColor: "inverse" },
  };

  const v = variantStyles[variant];

  return (
    <AnimatedPressable
      testID={testID}
      disabled={isDisabled}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: animation.fast });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: animation.fast });
      }}
      onPress={onPress}
      style={[
        styles.base,
        animatedStyle,
        {
          backgroundColor: v.backgroundColor,
          borderColor: v.borderColor,
          borderWidth: v.borderColor ? 1.5 : 0,
          paddingVertical: SIZE_MAP[size].paddingVertical,
          opacity: isDisabled ? 0.55 : 1,
          width: fullWidth ? "100%" : undefined,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "danger" ? theme.textInverse : theme.primary} />
      ) : (
        <>
          {icon}
          <Text variant="bodyStrong" color={v.textColor} style={icon ? styles.labelWithIcon : undefined}>
            {label}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    gap: spacing.xs,
  },
  labelWithIcon: {
    marginLeft: spacing.xs,
  },
});
