import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Toast from "react-native-toast-message";
import { Button, Card, ErrorState, Input, Screen, SkeletonCard, Text } from "@components/ui";
import { spacing } from "@constants/theme";
import { formatDate, formatNumber, labelize, todayISODate } from "@utils/formatters";
import { useAuthStore } from "@services/state/authStore";
import { can } from "@utils/permissions";
import { useStockHistory, useStockItem, useLogStockHistory } from "@features/stock/hooks/useStock";
import {
  EMPTY_STOCK_HISTORY_FORM,
  stockHistoryFormSchema,
  type StockHistoryFormSchema,
} from "@features/stock/schemas";

export default function StockItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const farmId = user?.farmId ?? "";
  const canLog = can(user?.role, "UPDATE_STOCK");
  const today = todayISODate();
  const monthStart = `${today.slice(0, 7)}-01`;

  const item = useStockItem(id);
  const history = useStockHistory(id, monthStart, today);
  const logHistory = useLogStockHistory(farmId);

  const { control, handleSubmit, reset } = useForm<StockHistoryFormSchema>({
    resolver: zodResolver(stockHistoryFormSchema),
    defaultValues: EMPTY_STOCK_HISTORY_FORM,
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!id) return;
    try {
      await logHistory.mutateAsync({
        stockItemId: id,
        date: today,
        harvestedToday: values.harvestedToday ? Number(values.harvestedToday) : 0,
        soldToday: values.soldToday ? Number(values.soldToday) : 0,
        damaged: values.damaged ? Number(values.damaged) : 0,
        notes: values.notes || null,
      });
      Toast.show({ type: "success", text1: "Stock updated for today" });
      reset(EMPTY_STOCK_HISTORY_FORM);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Couldn't log stock",
        text2: error instanceof Error ? error.message : "Please try again.",
      });
    }
  });

  if (item.isError) {
    return <ErrorState message="Couldn't load this stock item." onRetry={() => item.refetch()} />;
  }
  if (item.isLoading || !item.data) {
    return (
      <Screen contentContainerStyle={styles.container}>
        <SkeletonCard />
      </Screen>
    );
  }

  const stockItem = item.data;

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <Card>
        <Text variant="title">{stockItem.name}</Text>
        <Text variant="caption" color="secondary" style={styles.category}>
          {labelize(stockItem.category)}
          {stockItem.location ? ` · ${stockItem.location}` : ""}
        </Text>
        <View style={styles.stat}>
          <Text variant="caption" color="secondary">
            Current quantity
          </Text>
          <Text variant="display" color="brand">
            {formatNumber(stockItem.quantity)} {stockItem.unit}
          </Text>
        </View>
        {stockItem.lowStockThreshold != null ? (
          <Text variant="caption" color="secondary">
            Low stock alert below {formatNumber(stockItem.lowStockThreshold)} {stockItem.unit}
          </Text>
        ) : null}
      </Card>

      {canLog ? (
        <Card>
          <Text variant="bodyStrong" style={styles.formTitle}>
            Log today's stock — {formatDate(today)}
          </Text>
          <View style={styles.form}>
            <Controller
              control={control}
              name="harvestedToday"
              render={({ field, fieldState }) => (
                <Input
                  label="Harvested today"
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="soldToday"
              render={({ field, fieldState }) => (
                <Input
                  label="Sold today"
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="damaged"
              render={({ field, fieldState }) => (
                <Input
                  label="Damaged / lost"
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <Input
                  label="Notes (optional)"
                  placeholder="Anything worth noting"
                  multiline
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Button label="Save today's entry" onPress={onSubmit} loading={logHistory.isPending} fullWidth />
          </View>
        </Card>
      ) : null}

      <Card>
        <Text variant="bodyStrong" style={styles.formTitle}>
          This month
        </Text>
        {history.isLoading ? (
          <SkeletonCard />
        ) : (history.data?.length ?? 0) === 0 ? (
          <Text variant="body" color="secondary">
            No entries logged this month yet.
          </Text>
        ) : (
          <View style={styles.historyList}>
            {(history.data ?? [])
              .slice()
              .reverse()
              .map((entry) => (
                <View key={entry.id} style={styles.historyRow}>
                  <Text variant="caption" color="secondary">
                    {formatDate(entry.date)}
                  </Text>
                  <Text variant="caption">
                    +{formatNumber(entry.harvestedToday)} / -{formatNumber(entry.soldToday)} / -
                    {formatNumber(entry.damaged)} damaged
                  </Text>
                  <Text variant="caption" color="brand">
                    {formatNumber(entry.remainingStock)} {stockItem.unit}
                  </Text>
                </View>
              ))}
          </View>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  category: { marginTop: 2, marginBottom: spacing.sm },
  stat: { marginBottom: spacing.xs },
  formTitle: { marginBottom: spacing.sm },
  form: { gap: spacing.sm },
  historyList: { gap: spacing.xs },
  historyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.xs },
});
