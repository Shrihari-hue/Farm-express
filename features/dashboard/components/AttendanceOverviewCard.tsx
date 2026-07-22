import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing } from "@constants/theme";
import { Card, Skeleton, Text } from "@components/ui";
import type { AttendanceSummary } from "../api/dashboardApi";

interface Props {
  summary: AttendanceSummary | undefined;
  totalWorkers: number;
  isLoading: boolean;
}

/** Today's attendance breakdown — present/absent front and center (per the
 * dashboard brief), half-day/leave/late as smaller secondary chips. */
export function AttendanceOverviewCard({ summary, totalWorkers, isLoading }: Props) {
  const theme = useAppTheme();

  if (isLoading || !summary) {
    return (
      <Card style={styles.card}>
        <Skeleton width="40%" height={14} />
        <View style={styles.primaryRow}>
          <Skeleton width="45%" height={48} />
          <Skeleton width="45%" height={48} />
        </View>
      </Card>
    );
  }

  const notMarked = Math.max(totalWorkers - summary.totalMarked, 0);

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text variant="bodyStrong">Today's attendance</Text>
        <Text variant="caption" color="secondary">
          {summary.totalMarked}/{totalWorkers} marked
        </Text>
      </View>

      <View style={styles.primaryRow}>
        <View style={styles.primaryStat}>
          <Text variant="title" color="success">
            {summary.present}
          </Text>
          <Text variant="caption" color="secondary">
            Present
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.primaryStat}>
          <Text variant="title" color="danger">
            {summary.absent}
          </Text>
          <Text variant="caption" color="secondary">
            Absent
          </Text>
        </View>
      </View>

      <View style={styles.chipRow}>
        <Chip label="Half day" value={summary.halfDay} />
        <Chip label="Leave" value={summary.leave} />
        <Chip label="Late" value={summary.late} />
        <Chip label="Not marked" value={notMarked} />
      </View>
    </Card>
  );
}

function Chip({ label, value }: { label: string; value: number }) {
  const theme = useAppTheme();
  return (
    <View style={[chipStyles.chip, { backgroundColor: theme.surfaceAlt }]}>
      <Text variant="label">{value}</Text>
      <Text variant="label" color="secondary">
        {" "}
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  primaryRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  primaryStat: { flex: 1, alignItems: "center", gap: 2 },
  divider: { width: StyleSheet.hairlineWidth, height: 40 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
});

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 999,
  },
});
