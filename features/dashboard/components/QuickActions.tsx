import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { CalendarCheck, PackagePlus, Receipt, ShoppingCart, UserPlus, type LucideIcon } from "lucide-react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing } from "@constants/theme";
import { Text } from "@components/ui";

interface QuickAction {
  label: string;
  icon: LucideIcon;
  /** Step the real screen ships in. */
  step: number;
  /** Set once that step ships — tapping navigates here instead of showing
   * the "coming soon" toast. */
  route?: string;
}

const ACTIONS: QuickAction[] = [
  { label: "Add Worker", icon: UserPlus, step: 6, route: "/(app)/workers/new" },
  { label: "Mark Attendance", icon: CalendarCheck, step: 7 },
  { label: "Record Sale", icon: ShoppingCart, step: 10 },
  { label: "Record Expense", icon: Receipt, step: 11 },
  { label: "Update Stock", icon: PackagePlus, step: 9 },
];

/**
 * Every action here deep-links into its module's real entry screen once
 * that module ships (Steps 6, 7, 9, 10, 11). Until then, tapping shows a
 * friendly toast instead of a broken route — the buttons themselves are
 * real and final, only their destinations are still being built.
 */
export function QuickActions() {
  const theme = useAppTheme();

  const handlePress = (action: QuickAction) => {
    if (action.route) {
      router.push(action.route as never);
      return;
    }
    Toast.show({
      type: "info",
      text1: action.label,
      text2: `Coming in Step ${action.step}`,
    });
  };

  return (
    <View>
      <Text variant="bodyStrong" style={styles.heading}>
        Quick actions
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {ACTIONS.map((action) => (
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
