import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { CalendarCheck, PackagePlus, Receipt, ShoppingCart, UserPlus, type LucideIcon } from "lucide-react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing } from "@constants/theme";
import { Text } from "@components/ui";
import { useAuthStore } from "@services/state/authStore";
import { can } from "@utils/permissions";
import type { PermissionKey } from "@utils/permissions";

interface QuickAction {
  label: string;
  icon: LucideIcon;
  route: string;
  /** Permission gating which roles see this action at all. */
  permission: PermissionKey;
}

const ACTIONS: QuickAction[] = [
  { label: "Add Worker", icon: UserPlus, route: "/(app)/workers/new", permission: "MANAGE_WORKERS" },
  { label: "Mark Attendance", icon: CalendarCheck, route: "/(app)/attendance", permission: "ENTER_ATTENDANCE" },
  { label: "Record Sale", icon: ShoppingCart, route: "/(app)/sales/new", permission: "MANAGE_SALES" },
  { label: "Record Expense", icon: Receipt, route: "/(app)/expenses/new", permission: "MANAGE_EXPENSES" },
  { label: "Update Stock", icon: PackagePlus, route: "/(app)/stock", permission: "UPDATE_STOCK" },
];

/** Every action deep-links into its module's real entry screen, filtered to
 * whatever the signed-in role is actually allowed to do. */
export function QuickActions() {
  const theme = useAppTheme();
  const role = useAuthStore((s) => s.user?.role);
  const actions = ACTIONS.filter((action) => can(role, action.permission));

  const handlePress = (action: QuickAction) => {
    router.push(action.route as never);
  };

  if (actions.length === 0) return null;

  return (
    <View>
      <Text variant="bodyStrong" style={styles.heading}>
        Quick actions
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {actions.map((action) => (
          <Pressable
            key={action.label}
            onPress={() => handlePress(action)}
            style={[styles.action, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
              <action.icon size={20} color={theme.primary} />
            </View>
            <Text variant="caption" align="center" style={styles.label}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.sm },
  row: { gap: spacing.sm, paddingRight: spacing.md },
  action: {
    width: 92,
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xxs,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { lineHeight: 14 },
});
