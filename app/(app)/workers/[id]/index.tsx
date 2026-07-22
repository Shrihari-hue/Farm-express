import type { ComponentType } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { Banknote, MapPin, Phone, StickyNote } from "lucide-react-native";
import { Avatar, Badge, Button, Card, Divider, ErrorState, Screen, Text } from "@components/ui";
import { spacing } from "@constants/theme";
import { useAppTheme } from "@hooks/useAppTheme";
import { useAuthStore } from "@services/state/authStore";
import { can, isOwner } from "@utils/permissions";
import { formatCurrency, formatDate, labelize } from "@utils/formatters";
import { PHONE_COUNTRY_CODE } from "@constants/config";
import { useDeleteWorker, useSetWorkerStatus, useWorkerQuery } from "@features/labour/hooks/useWorkers";
import { MonthlyAttendanceSummary } from "@features/attendance/components/MonthlyAttendanceSummary";

export default function WorkerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const farmId = user?.farmId ?? "";

  const { data: worker, isLoading, isError, refetch } = useWorkerQuery(id);
  const setStatus = useSetWorkerStatus(farmId, id ?? "");
  const deleteWorker = useDeleteWorker(farmId);

  const canManage = can(user?.role, "MANAGE_WORKERS");
  const canDelete = isOwner(user?.role);

  if (isLoading || !worker) {
    return isError ? (
      <Screen>
        <ErrorState message="Couldn't load this worker." onRetry={refetch} />
      </Screen>
    ) : null;
  }

  const handleToggleStatus = () => {
    const nextStatus = worker.status === "active" ? "inactive" : "active";
    Alert.alert(
      nextStatus === "inactive" ? "Deactivate worker?" : "Reactivate worker?",
      nextStatus === "inactive"
        ? `${worker.name} will be hidden from active lists, but their attendance and salary history is kept.`
        : `${worker.name} will show up in active lists again.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: nextStatus === "inactive" ? "Deactivate" : "Reactivate",
          style: nextStatus === "inactive" ? "destructive" : "default",
          onPress: () => setStatus.mutate(nextStatus),
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete worker permanently?",
      `This removes ${worker.name} and cannot be undone. Consider Deactivate instead if you want to keep their history.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWorker.mutateAsync(worker.id);
              Toast.show({ type: "success", text1: "Worker deleted" });
              router.back();
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Couldn't delete worker",
                text2: error instanceof Error ? error.message : "Please try again.",
              });
            }
          },
        },
      ],
    );
  };

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Avatar name={worker.name} imageUrl={worker.photoUrl} size={80} />
        <Text variant="title" align="center">
          {worker.name}
        </Text>
        <View style={styles.badgeRow}>
          <Badge label={worker.type === "permanent" ? "Permanent" : "Casual"} tone="brand" />
          <Badge label={labelize(worker.status)} tone={worker.status === "active" ? "success" : "neutral"} />
        </View>
      </View>

      <Card style={styles.card}>
        <Row icon={Phone} label="Phone" value={worker.phone ? `${PHONE_COUNTRY_CODE} ${worker.phone}` : "—"} />
        {worker.type === "permanent" ? (
          <>
            <Divider />
            <Row icon={MapPin} label="Address" value={worker.address || "—"} />
            <Divider />
            <Row label="Joining date" value={formatDate(worker.joiningDate)} />
            <Divider />
            <Row
              icon={Banknote}
              label="Monthly salary"
              value={worker.monthlySalary != null ? formatCurrency(worker.monthlySalary) : "Not set"}
            />
          </>
        ) : (
          <>
            <Divider />
            <Row icon={MapPin} label="Village" value={worker.village || "—"} />
            <Divider />
            <Row
              icon={Banknote}
              label="Daily wage"
              value={worker.dailyWage != null ? formatCurrency(worker.dailyWage) : "Not set"}
            />
          </>
        )}
      </Card>

      {worker.type === "permanent" && worker.bankDetails && Object.values(worker.bankDetails).some(Boolean) ? (
        <Card style={styles.card}>
          <Text variant="bodyStrong">Bank details</Text>
          {worker.bankDetails.accountHolder ? (
            <Row label="Account holder" value={worker.bankDetails.accountHolder} />
          ) : null}
          {worker.bankDetails.accountNumber ? (
            <Row label="Account number" value={worker.bankDetails.accountNumber} />
          ) : null}
          {worker.bankDetails.ifsc ? <Row label="IFSC" value={worker.bankDetails.ifsc} /> : null}
          {worker.bankDetails.bankName ? <Row label="Bank" value={worker.bankDetails.bankName} /> : null}
          {worker.bankDetails.branch ? <Row label="Branch" value={worker.bankDetails.branch} /> : null}
        </Card>
      ) : null}

      {worker.notes ? (
        <Card style={styles.card}>
          <View style={styles.notesHeader}>
            <StickyNote size={16} color={theme.textSecondary} />
            <Text variant="bodyStrong">Notes</Text>
          </View>
          <Text variant="body" color="secondary">
            {worker.notes}
          </Text>
        </Card>
      ) : null}

      <MonthlyAttendanceSummary workerId={worker.id} />

      <Card style={styles.card}>
        <Text variant="caption" color="secondary">
          Salary slips will appear here once Step 8 ships.
        </Text>
      </Card>

      {canManage ? (
        <View style={styles.actions}>
          <Button
            label="Edit details"
            variant="secondary"
            fullWidth
            onPress={() => router.push(`/(app)/workers/${worker.id}/edit`)}
          />
          <Button
            label={worker.status === "active" ? "Deactivate" : "Reactivate"}
            variant="outline"
            fullWidth
            loading={setStatus.isPending}
            onPress={handleToggleStatus}
          />
          {canDelete ? (
            <Button
              label="Delete permanently"
              variant="danger"
              fullWidth
              loading={deleteWorker.isPending}
              onPress={handleDelete}
            />
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon?: ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
}) {
  const theme = useAppTheme();
  return (
    <View style={rowStyles.row}>
      {Icon ? <Icon size={16} color={theme.textSecondary} /> : null}
      <Text variant="caption" color="secondary" style={rowStyles.label}>
        {label}
      </Text>
      <Text variant="body" style={rowStyles.value} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xxl },
  header: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.md },
  badgeRow: { flexDirection: "row", gap: spacing.xs },
  card: { gap: spacing.sm },
  notesHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  actions: { gap: spacing.sm },
});

const rowStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingVertical: 2 },
  label: { width: 100 },
  value: { flex: 1 },
});
