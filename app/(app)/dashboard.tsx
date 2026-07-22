import { router } from "expo-router";
import { Screen, Text, Button, Card } from "@components/ui";
import { spacing } from "@constants/theme";
import { useAuthStore } from "@services/state/authStore";
import { useSignOut } from "@features/auth/hooks/useAuthMutations";
import { labelize } from "@utils/formatters";

/**
 * Temporary placeholder for the authenticated home — enough to prove the
 * full auth loop (sign in -> complete profile -> land here -> sign out)
 * end-to-end. The real dashboard (attendance summary, sales/expenses,
 * stock, quick actions, charts) is built in Step 5 once the database
 * (Step 4) exists to feed it real data.
 */
export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useSignOut();

  const handleSignOut = async () => {
    await signOut.mutateAsync();
    router.replace("/(auth)/login");
  };

  return (
    <Screen contentContainerStyle={{ gap: spacing.md }}>
      <Text variant="title">Dashboard</Text>

      <Card style={{ gap: spacing.xxs }}>
        <Text variant="bodyStrong">{user?.fullName || "Signed in"}</Text>
        <Text variant="caption" color="secondary">
          {user?.email ?? user?.phone ?? "—"}
        </Text>
        <Text variant="caption" color="brand">
          Role: {user ? labelize(user.role) : "—"}
        </Text>
      </Card>

      <Text variant="body" color="secondary">
        The full dashboard (attendance, sales, stock, expenses, quick actions and charts) is
        coming in Step 5, once the database schema (Step 4) is in place.
      </Text>

      <Button label="Sign out" variant="outline" onPress={handleSignOut} loading={signOut.isPending} />
    </Screen>
  );
}
