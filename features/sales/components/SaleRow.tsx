import React from "react";
import { StyleSheet, View } from "react-native";
import { Badge, Card, Text } from "@components/ui";
import { spacing } from "@constants/theme";
import { formatCurrency, formatDate, labelize } from "@utils/formatters";
import type { Sale } from "@app-types/models";

interface Props {
  sale: Sale;
  stockItemName?: string;
  buyerName?: string;
}

export function SaleRow({ sale, stockItemName, buyerName }: Props) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Text variant="bodyStrong" numberOfLines={1} style={styles.name}>
          {stockItemName ?? "Stock item"}
        </Text>
        <Text variant="bodyStrong" color="brand">
          {formatCurrency(sale.netAmount)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text variant="caption" color="secondary" numberOfLines={1}>
          {buyerName ?? "Buyer"} · {formatDate(sale.date)}
        </Text>
        <Badge label={labelize(sale.paymentMethod)} tone="neutral" />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xxs },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.xs },
  name: { flexShrink: 1 },
});
