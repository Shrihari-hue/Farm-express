import React, { forwardRef, useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing } from "@constants/theme";
import { Text } from "./Text";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/** Base text input with label/error states, wired for React Hook Form via
 * `forwardRef` so `register`/`Controller` can attach directly to it. */
export const Input = forwardRef<TextInput, Props>(
  ({ label, error, helperText, leftIcon, rightIcon, style, onFocus, onBlur, ...rest }, ref) => {
    const theme = useAppTheme();
    const [isFocused, setIsFocused] = useState(false);

    const borderColor = error ? theme.danger : isFocused ? theme.primary : theme.border;

    return (
      <View style={styles.wrapper}>
        {label ? (
          <Text variant="label" color="secondary" style={styles.label}>
            {label}
          </Text>
        ) : null}
        <View
          style={[
            styles.inputRow,
            { borderColor, backgroundColor: theme.surface },
          ]}
        >
          {leftIcon}
          <TextInput
            ref={ref}
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.textPrimary }, style]}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />
          {rightIcon}
        </View>
        {error ? (
          <Text variant="caption" color="danger" style={styles.helper}>
            {error}
          </Text>
        ) : helperText ? (
          <Text variant="caption" color="secondary" style={styles.helper}>
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  },
);
Input.displayName = "Input";

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  label: { marginBottom: spacing.xxs },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    minHeight: 48,
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
  helper: { marginTop: spacing.xxs },
});
