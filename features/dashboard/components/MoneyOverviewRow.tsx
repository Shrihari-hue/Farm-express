import React from "react";
import { StyleSheet, View } from "react-native";
import { TrendingDown, TrendingUp } from "lucide-react-native";
import { spacing } from "@constants/theme";
import { Card, Skeleton, StatCard } from "@components/ui";
import { formatCurrency } from "@utils/formatters";

interface Props {
  sales: number | undefined;
  expenses: number | undefined;
  isLoading: boolean;
}

export function MoneyOverviewRow({ sales, expenses, isLoading }: Props) {
  if (isLoading || sales === undefined || expenses === undefined) {
    return (
      <Card style={styles.loadingCard}>
        <Skeleton width="100%" height={64} />
      </Card>
    );
  }

  return (
    <View style={styles.row}>
      <StatCard label="Today's sales" value={formatCurrency(sales)} icon={TrendingUp} tone="success" />
      <StatCard label="Today's expenses" value={formatCurrency(expenses)} icon={TrendingDown} tone="danger" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm },
  loadingCard: { minHeight: 64 },
});
