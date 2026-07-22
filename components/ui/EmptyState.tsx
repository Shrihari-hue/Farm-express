import React from "react";
import { StyleSheet, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Inbox } from "lucide-react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing } from "@constants/theme";
import { Text } from "./Text";
import { Button } from "./Button";

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Shown instead of a blank screen whenever a list has zero rows — every
 * module (workers, sales, stock, etc.) should reuse this rather than a
 * one-off "No data" text. */
export function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction }: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
        <Icon size={28} color={theme.primary} />
      </View>
      <Text variant="subtitle" align="center" style={styles.title}>
        {title}
      </Text>
      {description ? (
        <Text variant="body" color="secondary" align="center" style={styles.description}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" size="sm" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: { marginTop: spacing.xs },
  description: { marginBottom: spacing.sm },
});
