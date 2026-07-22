import React from "react";
import { StyleSheet, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing } from "@constants/theme";
import { Card } from "./Card";
import { Text } from "./Text";

interface Props {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "brand" | "success" | "warning" | "danger" | "info";
  trend?: { value: string; positive: boolean };
  onPress?: () => void;
}

/** The dashboard's core metric tile — "Today's Attendance", "Today's
 * Sales", "Current Stock", etc. all render through this one component. */
export function StatCard({ label, value, icon: Icon, tone = "brand", onPress, trend }: Props) {
  const theme = useAppTheme();

  const toneColor: Record<NonNullable<Props["tone"]>, string> = {
    brand: theme.primary,
    success: theme.success,
    warning: theme.warning,
    danger: theme.danger,
    info: theme.info,
  };

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
          <Icon size={20} color={toneColor[tone]} />
        </View>
        {trend ? (
          <Text variant="caption" color={trend.positive ? "success" : "danger"}>
            {trend.positive ? "▲" : "▼"} {trend.value}
          </Text>
        ) : null}
      </View>
      <Text variant="title" style={styles.value}>
        {value}
      </Text>
      <Text variant="caption" color="secondary">
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 150 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  value: { marginTop: spacing.sm, marginBottom: 2 },
});
