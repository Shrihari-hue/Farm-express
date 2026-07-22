import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Plus, Search, Users } from "lucide-react-native";
import { EmptyState, ErrorState, Input, Screen, SegmentedControl, SkeletonCard } from "@components/ui";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing } from "@constants/theme";
import { useAuthStore } from "@services/state/authStore";
import { can } from "@utils/permissions";
import { useWorkersQuery } from "@features/labour/hooks/useWorkers";
import { WorkerListItem } from "@features/labour/components/WorkerListItem";
import type { LabourType } from "@constants/config";

export default function WorkersListScreen() {
  const theme = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const farmId = user?.farmId ?? "";
  const [type, setType] = useState<LabourType>("permanent");
  const [search, setSearch] = useState("");

  const { data: workers, isLoading, isFetching, isError, refetch } = useWorkersQuery(farmId, type);
  const canManage = can(user?.role, "MANAGE_WORKERS");

  const filtered = useMemo(() => {
    if (!workers) return [];
    const query = search.trim().toLowerCase();
    if (!query) return workers;
    return workers.filter(
      (worker) => worker.name.toLowerCase().includes(query) || worker.phone?.includes(query),
    );
  }, [workers, search]);

  return (
    <Screen padded={false} contentContainerStyle={styles.screen}>
      <View style={styles.headerArea}>
        <SegmentedControl
          value={type}
          onChange={setType}
          options={[
            { value: "permanent", label: "Permanent" },
            { value: "casual", label: "Casual" },
          ]}
        />
        <Input
          placeholder="Search by name or phone"
          value={search}
          onChangeText={setSearch}
          leftIcon={<Search size={16} color={theme.textSecondary} />}
        />
      </View>

      {isError ? (
        <ErrorState message="Couldn't load workers." onRetry={refetch} />
      ) : isLoading ? (
        <View style={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={theme.primary} />}
          renderItem={({ item }) => (
            <WorkerListItem worker={item} onPress={() => router.push(`/(app)/workers/${item.id}`)} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <EmptyState
              icon={Users}
              title={search ? "No matches" : `No ${type} workers yet`}
              description={
                search
                  ? "Try a different name or phone number."
                  : canManage
                    ? "Add your first worker to start tracking attendance and salary."
                    : "Your supervisor hasn't added anyone here yet."
              }
              actionLabel={!search && canManage ? "Add worker" : undefined}
              onAction={!search && canManage ? () => router.push("/(app)/workers/new") : undefined}
            />
          }
        />
      )}

      {canManage ? (
        <Pressable
          onPress={() => router.push("/(app)/workers/new")}
          style={[styles.fab, { backgroundColor: theme.primary }]}
          accessibilityLabel="Add worker"
        >
          <Plus size={24} color={theme.textInverse} />
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerArea: { padding: spacing.md, gap: spacing.sm },
  list: { padding: spacing.md, paddingTop: 0, gap: spacing.sm, flexGrow: 1 },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
