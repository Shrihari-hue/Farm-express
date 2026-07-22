import React from "react";
import { StyleSheet, View } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing } from "@constants/theme";
import { Text } from "./Text";
import { Button } from "./Button";

interface Props {
  message?: string;
  onRetry?: () => void;
}

/** Consistent error surface for failed queries — pairs with EmptyState so
 * every list screen has exactly three states covered: loading, empty, error. */
export function ErrorState({ message = "Something went wrong. Please try again.", onRetry }: Props) {
  const theme = useAppTheme();
  return (
    <View style={styles.container}>
      <AlertTriangle size={32} color={theme.danger} />
      <Text variant="body" color="secondary" align="center" style={styles.message}>
        {message}
      </Text>
      {onRetry ? <Button label="Retry" onPress={onRetry} variant="outline" size="sm" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", gap: spacing.sm, padding: spacing.lg },
  message: { marginBottom: spacing.xs },
});
