import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Toast from "react-native-toast-message";
import { Button, ChipSelect, DateField, Input, Screen, Text } from "@components/ui";
import { spacing } from "@constants/theme";
import { EXPENSE_CATEGORIES } from "@constants/config";
import { labelize, todayISODate } from "@utils/formatters";
import { useAuthStore } from "@services/state/authStore";
import { useRecordExpense } from "@features/expenses/hooks/useExpenses";
import { EMPTY_EXPENSE_FORM, expenseFormSchema, type ExpenseFormSchema } from "@features/expenses/schemas";

const CATEGORY_OPTIONS = Object.values(EXPENSE_CATEGORIES).map((value) => ({ value, label: labelize(value) }));

export default function NewExpenseScreen() {
  const user = useAuthStore((s) => s.user);
  const farmId = user?.farmId ?? "";
  const recordExpense = useRecordExpense(farmId);

  const { control, handleSubmit } = useForm<ExpenseFormSchema>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: { ...EMPTY_EXPENSE_FORM, date: todayISODate() },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await recordExpense.mutateAsync({
        category: values.category,
        amount: Number(values.amount),
        date: values.date,
        notes: values.notes || null,
      });
      Toast.show({ type: "success", text1: "Expense recorded" });
      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Couldn't record expense",
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
          name="amount"
          render={({ field, fieldState }) => (
            <Input
              label="Amount"
              placeholder="0"
              keyboardType="decimal-pad"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              leftIcon={<Text color="secondary">₹</Text>}
            />
          )}
        />
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DateField label="Date" value={field.value} onChange={field.onChange} maxDate={todayISODate()} />
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <Input
              label="Notes (optional)"
              placeholder="What was this for?"
              multiline
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        <Button
          label="Add expense"
          onPress={onSubmit}
          loading={recordExpense.isPending}
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
