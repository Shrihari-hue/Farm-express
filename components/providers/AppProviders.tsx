import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient } from "@services/query/queryClient";
import { queryPersister } from "@services/query/persister";
import { initOfflineDatabase } from "@services/offline/db";
import { startSyncEngine } from "@services/offline/syncEngine";

interface Props {
  children: React.ReactNode;
}

/**
 * Wraps the whole app with every cross-cutting provider: gesture handling,
 * safe-area insets, and the offline-first React Query cache. Also boots the
 * local SQLite outbox + background sync loop exactly once per app launch.
 *
 * Keeping this in one component (instead of nesting providers directly in
 * `app/_layout.tsx`) keeps the router file focused purely on navigation.
 */
export function AppProviders({ children }: Props) {
  useEffect(() => {
    initOfflineDatabase();
    const stopSync = startSyncEngine();
    return stopSync;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: queryPersister, maxAge: 24 * 60 * 60 * 1000 }}
        >
          {children}
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
