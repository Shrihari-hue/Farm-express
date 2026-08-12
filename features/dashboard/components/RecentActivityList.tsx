import React from "react";
import { StyleSheet, View } from "react-native";
import { Activity } from "lucide-react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing, radii } from "@constants/theme";
import { Card, EmptyState, Skeleton, Text } from "@components/ui";
import { formatRelativeTime, labelize } from "@utils/formatters";
import type { ActivityLog } from "@app-types/models";

interface Props {
  activity: ActivityLog[] | undefined;
  isLoading: boolean;
}

function describe(entry: ActivityLog): string {
  // "farm_created" -> "Farm created", "worker_added" -> "Worker added", etc.
  return labelize(entry.action);
}

export function RecentActivityList({ activity, isLoading }: Props) {
  const theme = useAppTheme();

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <Text variant="bodyStrong" style={styles.heading}>
          Recent activity
        </Text>
        <View style={{ gap: spacing.sm }}>
          <Skeleton width="100%" height={14} />
          <Skeleton width="80%" height={14} />
          <Skeleton width="60%" height={14} />
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Text variant="bodyStrong" style={styles.heading}>
        Recent activity
      </Text>

      {!activity || activity.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Actions across labour, attendance, stock, sales and expenses will show up here as your team uses the app."
        />
      ) : (
        <View style={styles.list}>
          {activity.map((entry, index) => (
            <View
              key={entry.id}
              style={[
                styles.row,
                index < activity.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: theme.primary }]} />
              <View style={styles.rowText}>
                <Text variant="body">{describe(entry)}</Text>
                <Text variant="caption" color="secondary">
                  {formatRelativeTime(entry.createdAt)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  heading: {},
  list: { gap: 0 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  dot: { width: 8, height: 8, borderRadius: radii.full, marginTop: 6 },
  rowText: { flex: 1, gap: 2 },
});
