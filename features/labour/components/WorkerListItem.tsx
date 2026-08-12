import React from "react";
import { StyleSheet, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing } from "@constants/theme";
import { Avatar, Badge, Card, Text } from "@components/ui";
import { formatCurrency } from "@utils/formatters";
import type { Worker } from "@app-types/models";

interface Props {
  worker: Worker;
  onPress: () => void;
}

export function WorkerListItem({ worker, onPress }: Props) {
  const theme = useAppTheme();
  const wageLabel =
    worker.type === "permanent"
      ? worker.monthlySalary != null
        ? `${formatCurrency(worker.monthlySalary)} / month`
        : "Salary not set"
      : worker.dailyWage != null
        ? `${formatCurrency(worker.dailyWage)} / day`
        : "Wage not set";

  return (
    <Card onPress={onPress} style={styles.card}>
      <Avatar name={worker.name} imageUrl={worker.photoUrl} size={48} />
      <View style={styles.textCol}>
        <View style={styles.nameRow}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.name}>
            {worker.name}
          </Text>
          {worker.status === "inactive" ? <Badge label="Inactive" tone="neutral" /> : null}
        </View>
        <Text variant="caption" color="secondary" numberOfLines={1}>
          {worker.phone || (worker.type === "permanent" ? worker.address : worker.village) || "No contact info"}
        </Text>
        <Text variant="caption" color="brand">
          {wageLabel}
        </Text>
      </View>
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
