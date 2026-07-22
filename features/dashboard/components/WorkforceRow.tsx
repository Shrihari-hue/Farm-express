import React from "react";
import { StyleSheet, View } from "react-native";
import { UserCheck, Users } from "lucide-react-native";
import { spacing } from "@constants/theme";
import { Skeleton, StatCard, Card } from "@components/ui";
import { formatNumber } from "@utils/formatters";
import type { WorkerCounts } from "../api/dashboardApi";

interface Props {
  counts: WorkerCounts | undefined;
  isLoading: boolean;
}

export function WorkforceRow({ counts, isLoading }: Props) {
  if (isLoading || !counts) {
    return (
      <Card style={styles.loadingCard}>
        <Skeleton width="100%" height={64} />
      </Card>
    );
  }

  return (
    <View style={styles.row}>
      <StatCard label="Permanent workers" value={formatNumber(counts.permanent)} icon={UserCheck} tone="brand" />
      <StatCard label="Casual workers" value={formatNumber(counts.casual)} icon={Users} tone="info" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm },
  loadingCard: { minHeight: 64 },
});
