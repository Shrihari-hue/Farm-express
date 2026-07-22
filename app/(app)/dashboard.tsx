import { Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { LogOut } from "lucide-react-native";
import { Badge, Screen, Text } from "@components/ui";
import { spacing } from "@constants/theme";
import { useAppTheme } from "@hooks/useAppTheme";
import { useAuthStore } from "@services/state/authStore";
import { useSignOut } from "@features/auth/hooks/useAuthMutations";
import { useDashboardData } from "@features/dashboard/hooks/useDashboardData";
import { QuickActions } from "@features/dashboard/components/QuickActions";
import { WorkforceRow } from "@features/dashboard/components/WorkforceRow";
import { AttendanceOverviewCard } from "@features/dashboard/components/AttendanceOverviewCard";
import { MoneyOverviewRow } from "@features/dashboard/components/MoneyOverviewRow";
import { StockOverviewCard } from "@features/dashboard/components/StockOverviewCard";
import { WeeklyTrendChart } from "@features/dashboard/components/WeeklyTrendChart";
import { RecentActivityList } from "@features/dashboard/components/RecentActivityList";
import { getTimeOfDayGreeting, labelize } from "@utils/formatters";

export default function DashboardScreen() {
  const theme = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const signOut = useSignOut();

  const farmId = user?.farmId ?? "";
  const data = useDashboardData(farmId);

  const handleSignOut = async () => {
    await signOut.mutateAsync();
    router.replace("/(auth)/login");
  };

  const isLabour = user?.role === "labour";
  const totalWorkers = (data.workerCounts.data?.permanent ?? 0) + (data.workerCounts.data?.casual ?? 0);

  return (
    <Screen
      scroll
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={data.isRefreshing} onRefresh={data.refetchAll} tintColor={theme.primary} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="caption" color="secondary">
            {getTimeOfDayGreeting()}
          </Text>
          <Text variant="title">{user?.fullName || "there"}</Text>
          <View style={styles.headerMeta}>
            {data.farm.data?.name ? (
              <Text variant="caption" color="secondary">
                {data.farm.data.name}
              </Text>
            ) : null}
            {user?.role ? <Badge label={labelize(user.role)} tone="brand" /> : null}
          </View>
        </View>
        <Pressable
          onPress={handleSignOut}
          hitSlop={12}
          style={[styles.signOutButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          accessibilityLabel="Sign out"
        >
          <LogOut size={18} color={theme.textSecondary} />
        </Pressable>
      </View>

      {isLabour ? (
        <View style={styles.labourNotice}>
          <Text variant="body" color="secondary">
            Your attendance and salary will appear here as soon as your supervisor links your worker
            profile and starts recording them — coming with Steps 7 and 8.
          </Text>
        </View>
      ) : (
        <View style={styles.sections}>
          <QuickActions />
          <WorkforceRow counts={data.workerCounts.data} isLoading={data.workerCounts.isLoading} />
          <AttendanceOverviewCard
            summary={data.attendanceSummary.data}
            totalWorkers={totalWorkers}
            isLoading={data.attendanceSummary.isLoading || data.workerCounts.isLoading}
          />
          <MoneyOverviewRow
            sales={data.todaySales.data}
            expenses={data.todayExpenses.data}
            isLoading={data.todaySales.isLoading || data.todayExpenses.isLoading}
          />
          <StockOverviewCard summary={data.stockSummary.data} isLoading={data.stockSummary.isLoading} />
          <WeeklyTrendChart data={data.weeklyTrend.data} isLoading={data.weeklyTrend.isLoading} />
          <RecentActivityList activity={data.recentActivity.data} isLoading={data.recentActivity.isLoading} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xxl },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerText: { flex: 1, gap: 2 },
  headerMeta: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xxs },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  labourNotice: { paddingVertical: spacing.xl },
  sections: { gap: spacing.md },
});
