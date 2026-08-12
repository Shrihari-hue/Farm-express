import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Toast from "react-native-toast-message";
import { Button, Card, ChipSelect, DateField, Input, PickerModal, Screen, Text } from "@components/ui";
import { spacing } from "@constants/theme";
import { PAYMENT_METHODS } from "@constants/config";
import { formatCurrency, formatNumber, labelize, todayISODate } from "@utils/formatters";
import { useAuthStore } from "@services/state/authStore";
import { useStockItems } from "@features/stock/hooks/useStock";
import { useBuyers, useCreateBuyer } from "@features/sales/hooks/useBuyers";
import { useRecordSale } from "@features/sales/hooks/useSales";
import { EMPTY_SALE_FORM, saleFormSchema, type SaleFormSchema } from "@features/sales/schemas";

const PAYMENT_OPTIONS = Object.values(PAYMENT_METHODS).map((value) => ({ value, label: labelize(value) }));

export default function NewSaleScreen() {
  const user = useAuthStore((s) => s.user);
  const farmId = user?.farmId ?? "";

  const stockItems = useStockItems(farmId);
  const buyers = useBuyers(farmId);
  const createBuyer = useCreateBuyer(farmId);
  const recordSale = useRecordSale(farmId);

  const [isStockPickerOpen, setIsStockPickerOpen] = useState(false);
  const [isBuyerPickerOpen, setIsBuyerPickerOpen] = useState(false);
  const [isAddingBuyer, setIsAddingBuyer] = useState(false);
  const [newBuyerName, setNewBuyerName] = useState("");
  const [newBuyerPhone, setNewBuyerPhone] = useState("");

  const { control, handleSubmit, watch, setValue } = useForm<SaleFormSchema>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: { ...EMPTY_SALE_FORM, date: todayISODate() },
  });

  const quantity = Number(watch("quantity")) || 0;
  const rate = Number(watch("rate")) || 0;
  const transportCost = Number(watch("transportCost")) || 0;
  const commission = Number(watch("commission")) || 0;
  const amount = quantity * rate;
  const netAmount = amount - transportCost - commission;

  const stockPickerItems = useMemo(
    () =>
      (stockItems.data ?? []).map((item) => ({
        id: item.id,
        label: item.name,
        subtitle: `${formatNumber(item.quantity)} ${item.unit} available`,
      })),
    [stockItems.data],
  );

  const buyerPickerItems = useMemo(
    () => (buyers.data ?? []).map((buyer) => ({ id: buyer.id, label: buyer.name, subtitle: buyer.phone ?? undefined })),
    [buyers.data],
  );

  const handleAddBuyer = async () => {
    if (!newBuyerName.trim()) return;
    try {
      const buyer = await createBuyer.mutateAsync({ name: newBuyerName.trim(), phone: newBuyerPhone.trim() || null });
      setValue("buyerId", buyer.id, { shouldValidate: true });
      setValue("buyerLabel", buyer.name);
      setIsAddingBuyer(false);
      setNewBuyerName("");
      setNewBuyerPhone("");
      setIsBuyerPickerOpen(false);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Couldn't add buyer",
        text2: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await recordSale.mutateAsync({
        stockItemId: values.stockItemId,
        buyerId: values.buyerId,
        quantity: Number(values.quantity),
        rate: Number(values.rate),
        transportCost: values.transportCost ? Number(values.transportCost) : 0,
        commission: values.commission ? Number(values.commission) : 0,
        paymentMethod: values.paymentMethod,
        date: values.date,
        remarks: values.remarks || null,
      });
      Toast.show({ type: "success", text1: "Sale recorded" });
      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Couldn't record sale",
        text2: error instanceof Error ? error.message : "Please try again.",
      });
    }
  });

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Controller
          control={control}
          name="stockItemId"
          render={({ field, fieldState }) => (
            <View>
              <Text variant="label" color="secondary" style={styles.pickerLabel}>
                Stock item
              </Text>
              <Button
                label={watch("stockItemLabel") || "Select stock item"}
                variant="outline"
                onPress={() => setIsStockPickerOpen(true)}
                fullWidth
              />
              {fieldState.error ? (
                <Text variant="caption" color="danger" style={styles.pickerError}>
                  {fieldState.error.message}
                </Text>
              ) : null}
              <PickerModal
                visible={isStockPickerOpen}
                title="Select stock item"
                items={stockPickerItems}
                emptyLabel="No stock items yet — add one from the Stock tab first."
                onSelect={(id) => {
                  const selected = stockItems.data?.find((i) => i.id === id);
                  field.onChange(id);
                  setValue("stockItemLabel", selected?.name ?? "");
                  setIsStockPickerOpen(false);
                }}
                onClose={() => setIsStockPickerOpen(false)}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="buyerId"
          render={({ field, fieldState }) => (
            <View>
              <Text variant="label" color="secondary" style={styles.pickerLabel}>
                Buyer
              </Text>
              <Button
                label={watch("buyerLabel") || "Select buyer"}
                variant="outline"
                onPress={() => setIsBuyerPickerOpen(true)}
                fullWidth
              />
              {fieldState.error ? (
                <Text variant="caption" color="danger" style={styles.pickerError}>
                  {fieldState.error.message}
                </Text>
              ) : null}
              <PickerModal
                visible={isBuyerPickerOpen}
                title="Select buyer"
                items={buyerPickerItems}
                emptyLabel="No buyers yet — add one below."
                onSelect={(id) => {
                  const selected = buyers.data?.find((b) => b.id === id);
                  field.onChange(id);
                  setValue("buyerLabel", selected?.name ?? "");
                  setIsBuyerPickerOpen(false);
                }}
                onClose={() => {
                  setIsBuyerPickerOpen(false);
                  setIsAddingBuyer(false);
                }}
                footer={
                  isAddingBuyer ? (
                    <View style={styles.addBuyerForm}>
                      <Input placeholder="New buyer name" value={newBuyerName} onChangeText={setNewBuyerName} />
                      <Input
                        placeholder="Phone (optional)"
                        keyboardType="number-pad"
                        value={newBuyerPhone}
                        onChangeText={setNewBuyerPhone}
                      />
                      <Button label="Add buyer" size="sm" onPress={handleAddBuyer} loading={createBuyer.isPending} />
                    </View>
                  ) : (
                    <Button
                      label="+ Add new buyer"
                      variant="ghost"
                      size="sm"
                      onPress={() => setIsAddingBuyer(true)}
                    />
                  )
                }
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="quantity"
          render={({ field, fieldState }) => (
            <Input
              label="Quantity"
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
          name="rate"
          render={({ field, fieldState }) => (
            <Input
              label="Rate (per unit)"
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
          name="transportCost"
          render={({ field, fieldState }) => (
            <Input
              label="Transport cost (optional)"
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
          name="commission"
          render={({ field, fieldState }) => (
            <Input
              label="Commission (optional)"
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
          name="paymentMethod"
          render={({ field }) => (
            <ChipSelect label="Payment method" value={field.value} onChange={field.onChange} options={PAYMENT_OPTIONS} />
          )}
        />

        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DateField label="Sale date" value={field.value} onChange={field.onChange} maxDate={todayISODate()} />
          )}
        />

        <Controller
          control={control}
          name="remarks"
          render={({ field }) => (
            <Input
              label="Remarks (optional)"
              placeholder="Anything worth noting"
              multiline
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        <Card style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text variant="body" color="secondary">
              Amount
            </Text>
            <Text variant="body">{formatCurrency(amount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodyStrong">Net amount</Text>
            <Text variant="bodyStrong" color="brand">
              {formatCurrency(netAmount)}
            </Text>
          </View>
        </Card>

        <Button label="Record sale" onPress={onSubmit} loading={recordSale.isPending} fullWidth style={styles.submit} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.xxl },
  form: { gap: spacing.md },
  pickerLabel: { marginBottom: spacing.xxs },
  pickerError: { marginTop: spacing.xxs },
  addBuyerForm: { gap: spacing.xs, marginBottom: spacing.xs },
  summary: { gap: spacing.xs },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  submit: { marginTop: spacing.xs },
});
