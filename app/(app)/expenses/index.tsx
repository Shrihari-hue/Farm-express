import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Plus, Receipt } from "lucide-react-native";
import { Button, EmptyState, ErrorState, Screen, SkeletonCard, Text } from "@components/ui";
import { spacing } from "@constants/theme";
import { useAppTheme } from "@hooks/useAppTheme";
import { useAuthStore } from "@services/state/authStore";
import { can } from "@utils/permissions";
import { formatCurrency, todayISODate } from "@utils/formatters";
import { useExpenses } from "@features/expenses/hooks/useExpenses";
import { ExpenseRow } from "@features/expenses/components/ExpenseRow";

export default function ExpensesScreen() {
  const theme = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const farmId = user?.farmId ?? "";
  const canRecord = can(user?.role, "MANAGE_EXPENSES");

  const today = todayISODate();
  const monthStart = `${today.slice(0, 7)}-01`;
  const expenses = useExpenses(farmId, monthStart, today);

  const totalThisMonth = (expenses.data ?? []).reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Screen padded={false} contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <Text variant="caption" color="secondary">
          This month's expenses
        </Text>
        <Text variant="title" color="danger">
          {formatCurrency(totalThisMonth)}
        </Text>
      </View>

      {expenses.isError ? (
        <ErrorState message="Couldn't load expenses." onRetry={() => expenses.refetch()} />
      ) : expenses.isLoading ? (
        <View style={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={expenses.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={expenses.isFetching} onRefresh={() => expenses.refetch()} tintColor={theme.primary} />
          }
          renderItem={({ item }) => <ExpenseRow expense={item} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <EmptyState
              icon={Receipt}
              title="No expenses recorded this month"
              description="Log fertilizer, fuel, and other farm costs to track spending."
              actionLabel={canRecord ? "Add expense" : undefined}
              onAction={canRecord ? () => router.push("/(app)/expenses/new" as never) : undefined}
            />
          }
        />
      )}

      {canRecord && (expenses.data?.length ?? 0) > 0 ? (
        <Button
          label="Add expense"
          icon={<Plus size={18} color={theme.textInverse} />}
          onPress={() => router.push("/(app)/expenses/new" as never)}
          style={styles.fab}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { padding: spacing.md, paddingBottom: spacing.sm, gap: 2 },
  list: { padding: spacing.md, paddingTop: 0, gap: spacing.sm, flexGrow: 1 },
  fab: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
});
