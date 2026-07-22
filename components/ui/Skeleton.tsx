import React, { useEffect } from "react";
import { StyleSheet, View, type DimensionValue } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii } from "@constants/theme";

interface Props {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}

/** Shimmering placeholder shown while a query is loading, instead of a
 * spinner — keeps perceived layout stable and feels "premium" per the
 * design brief's "beautiful loading screens" requirement. */
export function Skeleton({ width = "100%", height = 16, radius = radii.sm, style }: Props) {
  const theme = useAppTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: theme.skeleton },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Pre-composed skeleton for a typical dashboard/list card row. */
export function SkeletonCard() {
  return (
    <View style={styles.cardRow}>
      <Skeleton width={44} height={44} radius={22} />
      <View style={styles.cardLines}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  cardLines: { flex: 1, gap: 8 },
});
