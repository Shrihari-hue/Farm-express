import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing } from "@constants/theme";

export function Divider({ spacingY = spacing.sm }: { spacingY?: number }) {
  const theme = useAppTheme();
  return <View style={[styles.line, { backgroundColor: theme.border, marginVertical: spacingY }]} />;
}

const styles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth, width: "100%" },
});
