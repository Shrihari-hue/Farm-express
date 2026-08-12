import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Toast from "react-native-toast-message";
import { Button, ChipSelect, Input, Screen } from "@components/ui";
import { spacing } from "@constants/theme";
import { STOCK_CATEGORIES } from "@constants/config";
import { labelize } from "@utils/formatters";
import { useAuthStore } from "@services/state/authStore";
import { useCreateStockItem } from "@features/stock/hooks/useStock";
import { EMPTY_STOCK_ITEM_FORM, stockItemFormSchema, type StockItemFormSchema } from "@features/stock/schemas";

const CATEGORY_OPTIONS = Object.values(STOCK_CATEGORIES).map((value) => ({ value, label: labelize(value) }));

export default function NewStockItemScreen() {
  const user = useAuthStore((s) => s.user);
  const farmId = user?.farmId ?? "";
  const createStockItem = useCreateStockItem(farmId);

  const { control, handleSubmit } = useForm<StockItemFormSchema>({
    resolver: zodResolver(stockItemFormSchema),
    defaultValues: EMPTY_STOCK_ITEM_FORM,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createStockItem.mutateAsync({
        category: values.category,
        name: values.name,
        unit: values.unit,
        quantity: values.quantity ? Number(values.quantity) : 0,
        location: values.location || null,
        lowStockThreshold: values.lowStockThreshold ? Number(values.lowStockThreshold) : null,
      });
      Toast.show({ type: "success", text1: "Stock item added", text2: values.name });
      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Couldn't add item",
        text2: error instanceof Error ? error.message : "Please try again.",
      });
    }
  });

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Controller
          control={control}
          name="category"
          render={({ field, fieldState }) => (
            <ChipSelect
              label="Category"
              value={field.value}
              onChange={field.onChange}
              options={CATEGORY_OPTIONS}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <Input
              label="Item name"
              placeholder="e.g. Coconut Bags - Grade A"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="unit"
          render={({ field, fieldState }) => (
            <Input
              label="Unit"
              placeholder="e.g. bags, kg, quintals"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="quantity"
          render={({ field, fieldState }) => (
            <Input
              label="Starting quantity"
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
          name="location"
          render={({ field }) => (
            <Input
              label="Storage location (optional)"
              placeholder="e.g. Godown 1"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="lowStockThreshold"
          render={({ field, fieldState }) => (
            <Input
              label="Low stock alert threshold (optional)"
              placeholder="e.g. 10"
              keyboardType="decimal-pad"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Button
          label="Add item"
          onPress={onSubmit}
          loading={createStockItem.isPending}
          fullWidth
          style={styles.submit}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.xxl },
  form: { gap: spacing.md },
  submit: { marginTop: spacing.xs },
});
