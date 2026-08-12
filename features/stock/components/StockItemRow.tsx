import React from "react";
import { StyleSheet, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing } from "@constants/theme";
import { Badge, Card, Text } from "@components/ui";
import { formatNumber, labelize } from "@utils/formatters";
import type { StockItem } from "@app-types/models";

interface Props {
  item: StockItem;
  onPress: () => void;
}

export function StockItemRow({ item, onPress }: Props) {
  const theme = useAppTheme();
  const isLow = item.lowStockThreshold != null && item.quantity <= item.lowStockThreshold;

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.textCol}>
        <View style={styles.nameRow}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.name}>
            {item.name}
          </Text>
          {isLow ? <Badge label="Low stock" tone="warning" /> : null}
        </View>
        <Text variant="caption" color="secondary">
          {labelize(item.category)}
          {item.location ? ` · ${item.location}` : ""}
        </Text>
      </View>
      <Text variant="bodyStrong" color="brand">
        {formatNumber(item.quantity)} {item.unit}
      </Text>
      <ChevronRight size={18} color={theme.textSecondary} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  textCol: { flex: 1, gap: 2 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  name: { flexShrink: 1 },
});
