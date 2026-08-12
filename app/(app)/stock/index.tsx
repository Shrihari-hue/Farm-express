import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Plus, Warehouse } from "lucide-react-native";
import { Button, EmptyState, ErrorState, Screen, SkeletonCard } from "@components/ui";
import { spacing } from "@constants/theme";
import { useAppTheme } from "@hooks/useAppTheme";
import { useAuthStore } from "@services/state/authStore";
import { can } from "@utils/permissions";
import { useStockItems } from "@features/stock/hooks/useStock";
import { StockItemRow } from "@features/stock/components/StockItemRow";

export default function StockScreen() {
  const theme = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const farmId = user?.farmId ?? "";
  const canManage = can(user?.role, "UPDATE_STOCK");

  const stock = useStockItems(farmId);

  return (
    <Screen padded={false} contentContainerStyle={styles.screen}>
      {stock.isError ? (
        <ErrorState message="Couldn't load stock." onRetry={() => stock.refetch()} />
      ) : stock.isLoading ? (
        <View style={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={stock.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={stock.isFetching} onRefresh={() => stock.refetch()} tintColor={theme.primary} />
          }
          renderItem={({ item }) => (
            <StockItemRow item={item} onPress={() => router.push(`/(app)/stock/${item.id}` as never)} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <EmptyState
              icon={Warehouse}
              title="No stock items yet"
              description="Add your first stock item (coconut bags, arecanut, etc.) to start tracking harvest and sales."
              actionLabel={canManage ? "Add item" : undefined}
              onAction={canManage ? () => router.push("/(app)/stock/new" as never) : undefined}
            />
          }
        />
      )}

      {canManage && (stock.data?.length ?? 0) > 0 ? (
        <Button
          label="Add item"
          icon={<Plus size={18} color={theme.textInverse} />}
          onPress={() => router.push("/(app)/stock/new" as never)}
          style={styles.fab}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  fab: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
});
