import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Mail, Phone } from "lucide-react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing } from "@constants/theme";
import { Text } from "@components/ui";
import type { AuthMethod } from "../types";

interface Props {
  value: AuthMethod;
  onChange: (method: AuthMethod) => void;
}

/** Segmented control for switching between Email OTP and Phone OTP on the
 * login screen. */
export function AuthMethodTabs({ value, onChange }: Props) {
  const theme = useAppTheme();

  const tabs: { key: AuthMethod; label: string; icon: typeof Mail }[] = [
    { key: "phone", label: "Phone", icon: Phone },
    { key: "email", label: "Email", icon: Mail },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceAlt }]}>
      {tabs.map((tab) => {
        const isActive = value === tab.key;
        const Icon = tab.icon;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, isActive && { backgroundColor: theme.surface }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Icon size={16} color={isActive ? theme.primary : theme.textSecondary} />
            <Text variant="bodyStrong" color={isActive ? "brand" : "secondary"} style={styles.label}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: radii.md,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    gap: spacing.xxs,
  },
  label: { marginLeft: spacing.xxs },
});
