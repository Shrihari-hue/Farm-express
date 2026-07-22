import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing } from "@constants/theme";
import { Text } from "./Text";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface Props<T extends string> {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
}

/** Generic pill-style toggle — used for Permanent/Casual worker tabs, and
 * reusable anywhere else a small set of mutually-exclusive filters is
 * needed (e.g. attendance status filters in Step 7). */
export function SegmentedControl<T extends string>({ value, options, onChange }: Props<T>) {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceAlt }]}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, isActive && { backgroundColor: theme.surface }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text variant="bodyStrong" color={isActive ? "brand" : "secondary"}>
              {option.label}
              {option.count !== undefined ? ` (${option.count})` : ""}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: radii.md,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
});
