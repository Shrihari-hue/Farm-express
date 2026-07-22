import React from "react";
import { StyleSheet, View } from "react-native";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { Card, Skeleton, Text } from "@components/ui";
import { spacing } from "@constants/theme";
import { useWorkerAttendanceSummary } from "../hooks/useAttendance";

interface Props {
  workerId: string;
}

/** "This month" attendance card for the worker detail screen — present /
 * absent / half day / leave / late counts for the current calendar month. */
export function MonthlyAttendanceSummary({ workerId }: Props) {
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

  const { summary, isLoading } = useWorkerAttendanceSummary(workerId, monthStart, monthEnd);

  return (
    <Card style={styles.card}>
      <Text variant="bodyStrong">Attendance this month</Text>
      {isLoading ? (
        <Skeleton height={48} />
      ) : (
        <View style={styles.grid}>
          <Stat label="Present" value={summary.present} />
          <Stat label="Absent" value={summary.absent} />
          <Stat label="Half day" value={summary.halfDay} />
          <Stat label="Leave" value={summary.leave} />
          <Stat label="Late" value={summary.late} />
        </View>
      )}
      <Text variant="caption" color="secondary">
        {format(now, "MMMM yyyy")} — full history and salary calculation land in Step 8.
      </Text>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text variant="title">{value}</Text>
      <Text variant="caption" color="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  stat: { alignItems: "center", minWidth: 56 },
});
