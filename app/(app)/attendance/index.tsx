import { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { CalendarDays, Users } from "lucide-react-native";
import { Button, EmptyState, ErrorState, Screen, SkeletonCard, Text } from "@components/ui";
import { spacing } from "@constants/theme";
import { useAppTheme } from "@hooks/useAppTheme";
import { useNetworkStatus } from "@hooks/useNetworkStatus";
import { useAuthStore } from "@services/state/authStore";
import { can } from "@utils/permissions";
import { todayISODate } from "@utils/formatters";
import {
  useActiveWorkers,
  useAttendanceForDate,
  useMarkAllPresent,
  useMarkAttendance,
} from "@features/attendance/hooks/useAttendance";
import { AttendanceRow } from "@features/attendance/components/AttendanceRow";
import { DaySwitcher } from "@features/attendance/components/DaySwitcher";

export default function AttendanceScreen() {
  const theme = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const farmId = user?.farmId ?? "";
  const { isOnline } = useNetworkStatus();
  const params = useLocalSearchParams<{ date?: string }>();
  const [date, setDate] = useState(params.date || todayISODate());

  const canMark = can(user?.role, "ENTER_ATTENDANCE");

  const workers = useActiveWorkers(farmId);
  const attendance = useAttendanceForDate(farmId, date);
  const markAttendance = useMarkAttendance(farmId, date);
  const markAllPresent = useMarkAllPresent(farmId, date);

  const isLoading = workers.isLoading || attendance.isLoading;
  const isError = workers.isError || attendance.isError;

  const handleMarkAllPresent = () => {
    if (!workers.data?.length) return;
    markAllPresent.mutate(
      { workerIds: workers.data.map((w) => w.id), markedBy: user?.id ?? "" },
      {
        onSuccess: () => Toast.show({ type: "success", text1: "Marked everyone present" }),
        onError: (error) =>
          Toast.show({
            type: "error",
            text1: "Couldn't mark attendance",
            text2: error instanceof Error ? error.message : "Please try again.",
          }),
      },
    );
  };

  return (
    <Screen padded={false} contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <DaySwitcher date={date} onChange={setDate} />
        {!isOnline ? (
          <Text variant="caption" color="warning" style={styles.offlineNotice}>
            Offline — changes will sync once you're back online.
          </Text>
        ) : null}
      </View>

      {isError ? (
        <ErrorState
          message="Couldn't load attendance."
          onRetry={() => {
            workers.refetch();
            attendance.refetch();
          }}
        />
      ) : isLoading ? (
        <View style={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={workers.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={workers.isFetching || attendance.isFetching}
              onRefresh={() => {
                workers.refetch();
                attendance.refetch();
              }}
              tintColor={theme.primary}
            />
          }
          renderItem={({ item }) =>
            canMark ? (
              <AttendanceRow
                worker={item}
                attendance={attendance.byWorkerId.get(item.id)}
                onMark={(status, extra) =>
                  markAttendance.mutate(
                    {
                      farmId,
                      workerId: item.id,
                      date,
                      status,
                      todaysWage: extra.todaysWage,
                      workDone: extra.workDone,
                      remarks: null,
                      markedBy: user?.id ?? "",
                    },
                    {
                      onError: (error) =>
                        Toast.show({
                          type: "error",
                          text1: "Couldn't save attendance",
                          text2: error instanceof Error ? error.message : "Please try again.",
                        }),
                    },
                  )
                }
              />
            ) : (
              <AttendanceRow worker={item} attendance={attendance.byWorkerId.get(item.id)} onMark={() => {}} />
            )
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <EmptyState
              icon={Users}
              title="No active workers"
              description="Add workers first, then come back here to mark daily attendance."
            />
          }
          ListHeaderComponent={
            canMark && (workers.data?.length ?? 0) > 0
              ? () => (
                  <Button
                    label="Mark all present"
                    variant="secondary"
                    size="sm"
                    onPress={handleMarkAllPresent}
                    loading={markAllPresent.isPending}
                    style={styles.markAllButton}
                  />
                )
              : null
          }
        />
      )}

      <Button
        label="View history"
        variant="ghost"
        icon={<CalendarDays size={16} color={theme.primary} />}
        onPress={() => router.push("/(app)/attendance/history")}
        style={styles.historyButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { padding: spacing.md, gap: spacing.xs },
  offlineNotice: { textAlign: "center" },
  list: { padding: spacing.md, paddingTop: 0, gap: spacing.sm, flexGrow: 1 },
  markAllButton: { marginBottom: spacing.sm },
  historyButton: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
});
