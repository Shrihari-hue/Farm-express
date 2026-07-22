import React from "react";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii } from "@constants/theme";
import { getInitials } from "@utils/formatters";
import { Text } from "./Text";

interface Props {
  name: string;
  imageUrl?: string | null;
  size?: number;
}

/** Worker/user avatar — shows a photo when available, falling back to
 * initials on a soft brand-colored circle (never a broken-image icon). */
export function Avatar({ name, imageUrl, size = 44 }: Props) {
  const theme = useAppTheme();
  const dimensionStyle = { width: size, height: size, borderRadius: size };

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[dimensionStyle, styles.image]}
        contentFit="cover"
        transition={150}
      />
    );
  }

  return (
    <View style={[styles.fallback, dimensionStyle, { backgroundColor: theme.primarySoft }]}>
      <Text variant="bodyStrong" color="brand" style={{ fontSize: size * 0.38 }}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { borderRadius: radii.full },
  fallback: { alignItems: "center", justifyContent: "center" },
});
