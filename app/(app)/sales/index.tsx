import { useMemo } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Plus, ShoppingCart } from "lucide-react-native";
import { Button, EmptyState, ErrorState, Screen, SkeletonCard, Text } from "@components/ui";
import { spacing } from "@constants/theme";
import { useAppTheme } from "@hooks/useAppTheme";
import { useAuthStore } from "@services/state/authStore";
import { can } from "@utils/permissions";
import { formatCurrency, todayISODate } from "@utils/formatters";
import { useSales } from "@features/sales/hooks/useSales";
import { useBuyers } from "@features/sales/hooks/useBuyers";
import { useStockItems } from "@features/stock/hooks/useStock";
import { SaleRow } from "@features/sales/components/SaleRow";

export default function SalesScreen() {
  const theme = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const farmId = user?.farmId ?? "";
  const canRecord = can(user?.role, "MANAGE_SALES");

  const today = todayISODate();
  const monthStart = `${today.slice(0, 7)}-01`;

  const sales = useSales(farmId, monthStart, today);
  const stockItems = useStockItems(farmId);
  const buyers = useBuyers(farmId);

  const stockNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of stockItems.data ?? []) map.set(item.id, item.name);
    return map;
  }, [stockItems.data]);

  const buyerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const buyer of buyers.data ?? []) map.set(buyer.id, buyer.name);
    return map;
  }, [buyers.data]);

  const totalThisMonth = (sales.data ?? []).reduce((sum, sale) => sum + sale.netAmount, 0);

  return (
    <Screen padded={false} contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <Text variant="caption" color="secondary">
          This month's sales
        </Text>
        <Text variant="title" color="brand">
          {formatCurrency(totalThisMonth)}
        </Text>
      </View>

      {sales.isError ? (
        <ErrorState message="Couldn't load sales." onRetry={() => sales.refetch()} />
      ) : sales.isLoading ? (
        <View style={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={sales.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={sales.isFetching} onRefresh={() => sales.refetch()} tintColor={theme.primary} />
          }
          renderItem={({ item }) => (
            <SaleRow sale={item} stockItemName={stockNameById.get(item.stockItemId)} buyerName={buyerNameById.get(item.buyerId)} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <EmptyState
              icon={ShoppingCart}
              title="No sales recorded this month"
              description="Record your first sale to start tracking revenue."
              actionLabel={canRecord ? "Record sale" : undefined}
              onAction={canRecord ? () => router.push("/(app)/sales/new" as never) : undefined}
            />
          }
        />
      )}

      {canRecord && (sales.data?.length ?? 0) > 0 ? (
        <Button
          label="Record sale"
          icon={<Plus size={18} color={theme.textInverse} />}
          onPress={() => router.push("/(app)/sales/new" as never)}
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
