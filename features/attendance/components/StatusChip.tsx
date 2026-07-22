import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing } from "@constants/theme";
import { labelize } from "@utils/formatters";
import { Text } from "@components/ui";
import type { AttendanceStatus } from "@constants/config";

const STATUS_META: Record<AttendanceStatus, { short: string; tone: "success" | "danger" | "warning" | "info" | "brand" }> = {
  present: { short: "P", tone: "success" },
  absent: { short: "A", tone: "danger" },
  half_day: { short: "H", tone: "warning" },
  leave: { short: "L", tone: "info" },
  late: { short: "Lt", tone: "brand" },
};

interface Props {
  status: AttendanceStatus;
  selected: boolean;
  onPress: () => void;
}

/** One compact, color-coded pill per attendance status. Filled when this is
 * the worker's status for the day, outlined otherwise — five of these sit in
 * a row per `AttendanceRow` so marking someone present/absent is one tap. */
export function StatusChip({ status, selected, onPress }: Props) {
  const theme = useAppTheme();
  const meta = STATUS_META[status];

  const toneColor: Record<typeof meta.tone, string> = {
    success: theme.success,
    danger: theme.danger,
    warning: theme.warning,
    info: theme.info,
    brand: theme.primary,
  };
  const color = toneColor[meta.tone];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={labelize(status)}
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? color : "transparent",
          borderColor: color,
        },
      ]}
    >
      <Text variant="label" style={{ color: selected ? theme.textInverse : color }}>
        {meta.short}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: spacing.xxs,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
