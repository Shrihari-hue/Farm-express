import React from "react";
import { StyleSheet, View } from "react-native";
import { TriangleAlert, Boxes } from "lucide-react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing, radii } from "@constants/theme";
import { Card, Skeleton, Text } from "@components/ui";
import type { StockSummary } from "../api/dashboardApi";

interface Props {
  summary: StockSummary | undefined;
  isLoading: boolean;
}

export function StockOverviewCard({ summary, isLoading }: Props) {
  const theme = useAppTheme();

  if (isLoading || !summary) {
    return (
      <Card style={styles.card}>
        <Skeleton width="100%" height={56} />
      </Card>
    );
  }

  const hasLowStock = summary.lowStockCount > 0;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
          <Boxes size={20} color={theme.primary} />
        </View>
        <View style={styles.textCol}>
          <Text variant="bodyStrong">Current stock</Text>
          <Text variant="caption" color="secondary">
            {hasLowStock
              ? `${summary.lowStockCount} item${summary.lowStockCount === 1 ? "" : "s"} need restocking`
              : "Stock levels look healthy"}
          </Text>
        </View>
      </View>

      {hasLowStock ? (
        <View style={[styles.alertRow, { backgroundColor: theme.mode === "dark" ? "#3A1917" : "#FBE7E6" }]}>
          <TriangleAlert size={16} color={theme.danger} />
          <Text variant="caption" color="danger" style={styles.alertText}>
            {summary.lowStockCount} item{summary.lowStockCount === 1 ? "" : "s"} at or below the low-stock threshold
          </Text>
        </View>
      ) : (
        <Text variant="caption" color="secondary">
          No low-stock alerts right now.
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: { flex: 1 },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  alertText: { flex: 1 },
});
