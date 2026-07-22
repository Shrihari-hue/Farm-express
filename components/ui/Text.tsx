import React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { typography } from "@constants/theme";
import { useAppTheme } from "@hooks/useAppTheme";

export type TextVariant =
  | "display"
  | "title"
  | "subtitle"
  | "body"
  | "bodyStrong"
  | "caption"
  | "label";

export type TextColor = "primary" | "secondary" | "inverse" | "success" | "warning" | "danger" | "brand";

interface Props extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  align?: "left" | "center" | "right";
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<TextVariant, { size: number; lineHeight: number; weight: "400" | "500" | "600" | "700" }> = {
  display: { size: typography.size.display, lineHeight: typography.lineHeight.display, weight: "700" },
  title: { size: typography.size.xxl, lineHeight: typography.lineHeight.xxl, weight: "700" },
  subtitle: { size: typography.size.xl, lineHeight: typography.lineHeight.xl, weight: "600" },
  body: { size: typography.size.md, lineHeight: typography.lineHeight.md, weight: "400" },
  bodyStrong: { size: typography.size.md, lineHeight: typography.lineHeight.md, weight: "600" },
  caption: { size: typography.size.sm, lineHeight: typography.lineHeight.sm, weight: "400" },
  label: { size: typography.size.xs, lineHeight: typography.lineHeight.xs, weight: "600" },
};

/** The only Text component the app should use — guarantees every string
 * respects the design system's type scale and theme colors automatically. */
export function Text({ variant = "body", color = "primary", align, style, children, ...rest }: Props) {
  const theme = useAppTheme();
  const variantStyle = VARIANT_STYLES[variant];

  const colorMap: Record<TextColor, string> = {
    primary: theme.textPrimary,
    secondary: theme.textSecondary,
    inverse: theme.textInverse,
    success: theme.success,
    warning: theme.warning,
    danger: theme.danger,
    brand: theme.primary,
  };

  return (
    <RNText
      style={[
        {
          fontSize: variantStyle.size,
          lineHeight: variantStyle.lineHeight,
          fontWeight: variantStyle.weight,
          color: colorMap[color],
          textAlign: align,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
