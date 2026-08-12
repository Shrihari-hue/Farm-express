import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing } from "@constants/theme";
import { Text } from "./Text";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  label?: string;
  value: T | null;
  options: ChipOption<T>[];
  onChange: (value: T) => void;
  error?: string;
}

/** Wrapping row of single-select chips — used for category/payment-method
 * pickers where there are too many options for `SegmentedControl`'s
 * fixed-width row. */
export function ChipSelect<T extends string>({ label, value, options, onChange, error }: Props<T>) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="label" color="secondary" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View style={styles.row}>
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? theme.primary : theme.surfaceAlt,
                  borderColor: isActive ? theme.primary : theme.border,
                },
              ]}
            >
              <Text variant="caption" color={isActive ? "inverse" : "secondary"}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text variant="caption" color="danger" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  label: { marginBottom: spacing.xxs },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1.5,
  },
  error: { marginTop: spacing.xxs },
});
