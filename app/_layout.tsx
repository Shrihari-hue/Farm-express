import { useEffect, useState, useCallback } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { AppProviders } from "@components/providers/AppProviders";
import { useAppTheme } from "@hooks/useAppTheme";

// Keep the native splash screen visible until fonts/session are ready.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* no-op: fails harmlessly if already hidden (e.g. Fast Refresh) */
});

/**
 * Root layout for the whole app. Route groups below plug into this:
 *  - `(auth)`  — sign-in, OTP verification (Step 3)
 *  - `(app)`   — the authenticated, tab-based experience (Step 5+)
 *
 * `index.tsx` decides which group to redirect into based on session state.
 */
export default function RootLayout() {
  const theme = useAppTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // TODO(Step 3): also wait on Supabase session restoration here.
    const prepare = async () => {
      setIsReady(true);
    };
    void prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <AppProviders>
      <View style={{ flex: 1, backgroundColor: theme.background }} onLayout={onLayoutRootView}>
        <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </View>
    </AppProviders>
  );
}
