import { useEffect, useState } from "react";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { countPendingMutations } from "@services/offline/mutationQueue";

interface NetworkStatus {
  isOnline: boolean;
  isChecking: boolean;
  pendingSyncCount: number;
}

/** Used by the "You're offline — N changes will sync" banner and any
 * screen that needs to disable server-only actions while offline. */
export function useNetworkStatus(): NetworkStatus {
  const [state, setState] = useState<NetInfoState | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(setState);
    NetInfo.fetch().then(setState);

    const interval = setInterval(() => {
      setPendingSyncCount(countPendingMutations());
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline: !!(state?.isConnected && state?.isInternetReachable !== false),
    isChecking: state === null,
    pendingSyncCount,
  };
}
