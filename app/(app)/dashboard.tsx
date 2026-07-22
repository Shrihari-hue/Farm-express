import { Screen, Text } from "@components/ui";
import { spacing } from "@constants/theme";

/**
 * Temporary placeholder for the authenticated home. The real dashboard
 * (attendance summary, sales/expenses, stock, quick actions, charts) is
 * built in Step 5 once Authentication (Step 3) and the Database (Step 4)
 * are in place to actually feed it real data.
 */
export default function DashboardScreen() {
  return (
    <Screen contentContainerStyle={{ gap: spacing.xs }}>
      <Text variant="title">Dashboard</Text>
      <Text variant="body" color="secondary">
        Coming in Step 5, once auth and the database schema are approved.
      </Text>
    </Screen>
  );
}
