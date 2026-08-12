import React from "react";
import { StyleSheet, View } from "react-native";
import { Badge, Card, Text } from "@components/ui";
import { spacing } from "@constants/theme";
import { formatCurrency, formatDate, labelize } from "@utils/formatters";
import type { Expense } from "@app-types/models";

interface Props {
  expense: Expense;
}

export function ExpenseRow({ expense }: Props) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Badge label={labelize(expense.category)} tone="neutral" />
        <Text variant="bodyStrong" color="danger">
          {formatCurrency(expense.amount)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text variant="caption" color="secondary" numberOfLines={1} style={styles.notes}>
          {expense.notes || formatDate(expense.date)}
        </Text>
        {expense.notes ? (
          <Text variant="caption" color="secondary">
            {formatDate(expense.date)}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xxs },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.xs },
  notes: { flexShrink: 1 },
});
