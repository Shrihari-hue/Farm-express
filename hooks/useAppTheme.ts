import { useColorScheme } from "react-native";
import { darkTheme, lightTheme, type AppTheme } from "@constants/theme";
import { useThemeStore } from "@services/state/themeStore";

/** Resolves the *effective* theme object given the user's preference
 * (light / dark / system) and the OS color scheme. Every styled component
 * should call this rather than reading `useColorScheme` directly, so
 * switching to a manual override in Settings works everywhere at once. */
export function useAppTheme(): AppTheme {
  const preference = useThemeStore((s) => s.preference);
  const systemScheme = useColorScheme();

  const resolved = preference === "system" ? (systemScheme ?? "light") : preference;
  return resolved === "dark" ? darkTheme : lightTheme;
}
