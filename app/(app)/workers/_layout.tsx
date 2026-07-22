import { Stack } from "expo-router";
import { useAppTheme } from "@hooks/useAppTheme";

/** Nested stack for the Workers tab: list -> add / detail -> edit. Kept as
 * its own layout (rather than flattening into the tab root) so each screen
 * can have a proper header with a back button and title. */
export default function WorkersLayout() {
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
      <Stack.Screen name="index" options={{ title: "Workers" }} />
      <Stack.Screen name="new" options={{ title: "Add worker", presentation: "modal" }} />
      <Stack.Screen name="[id]/index" options={{ title: "Worker" }} />
      <Stack.Screen name="[id]/edit" options={{ title: "Edit worker", presentation: "modal" }} />
    </Stack>
  );
}
