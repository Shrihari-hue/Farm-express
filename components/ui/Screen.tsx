import React from "react";
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing } from "@constants/theme";

interface Props extends Omit<ViewProps, "style"> {
  scroll?: boolean;
  edges?: Edge[];
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/** Standard page wrapper: safe-area aware, theme background, optional
 * scrolling. Every route in `app/` should render its content inside this
 * instead of a bare `<View>` so spacing/background stays consistent.
 *
 * `style` applies to the outer container; `contentContainerStyle` (only
 * relevant when `scroll`) applies to the scrollable content, mirroring
 * ScrollView's own API so screens can center/grow content as needed. */
export function Screen({
  scroll = false,
  edges = ["top", "bottom"],
  padded = true,
  style,
  contentContainerStyle,
  children,
  ...rest
}: Props) {
  const theme = useAppTheme();

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: theme.background }]}>
      {scroll ? (
        <ScrollView
          style={[styles.flex, style]}
          contentContainerStyle={[padded && styles.padded, contentContainerStyle]}
          {...rest}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, padded && styles.padded, style]} {...rest}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { padding: spacing.md },
});
