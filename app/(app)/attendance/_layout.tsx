import { Stack } from "expo-router";
import { useAppTheme } from "@hooks/useAppTheme";

/** Nested stack for the Attendance tab: daily marking screen -> calendar
 * history. Mirrors the pattern in `app/(app)/workers/_layout.tsx`. */
export default function AttendanceLayout() {
  const theme = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.textPrimary,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Attendance" }} />
      <Stack.Screen name="history" options={{ title: "History" }} />
    </Stack>
  );
}
