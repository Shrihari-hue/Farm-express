import React, { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Search, X } from "lucide-react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing } from "@constants/theme";
import { Text } from "./Text";
import { Button } from "./Button";

export interface PickerItem {
  id: string;
  label: string;
  subtitle?: string;
}

interface Props {
  visible: boolean;
  title: string;
  items: PickerItem[];
  onSelect: (id: string) => void;
  onClose: () => void;
  emptyLabel?: string;
  /** Renders below the search field — used for an inline "create new"
   * affordance (e.g. add a buyer that doesn't exist yet). */
  footer?: React.ReactNode;
}

/** Generic search-and-select modal, built on the same Modal/backdrop/sheet
 * shape as `DateField`. Filters the given items client-side — farm-scale
 * lists (stock items, buyers) are small enough that this is simpler and
 * more responsive than a server-side search-as-you-type. */
export function PickerModal({ visible, title, items, onSelect, onClose, emptyLabel, footer }: Props) {
  const theme = useAppTheme();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) => item.label.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: theme.surface }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text variant="bodyStrong">{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          <View style={[styles.searchField, { borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}>
            <Search size={16} color={theme.textSecondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search"
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.textPrimary }]}
            />
          </View>

          {footer}

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            style={styles.list}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item.id)}
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.surfaceAlt }]}
              >
                <Text variant="body">{item.label}</Text>
                {item.subtitle ? (
                  <Text variant="caption" color="secondary">
                    {item.subtitle}
                  </Text>
                ) : null}
              </Pressable>
            )}
            ListEmptyComponent={
              <Text variant="body" color="secondary" align="center" style={styles.empty}>
                {emptyLabel ?? "No results"}
              </Text>
            }
          />

          <Button label="Close" variant="ghost" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  searchField: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  searchInput: { flex: 1, height: 44 },
  list: { flexGrow: 0 },
  row: { paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, gap: 2 },
  empty: { paddingVertical: spacing.lg },
});
