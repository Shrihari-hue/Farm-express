import { Tabs } from "expo-router";
import { CalendarCheck, LayoutGrid, Users } from "lucide-react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { useAuthStore } from "@services/state/authStore";

/**
 * Authenticated, tab-based experience. Salary, Stock, Sales, Expenses,
 * Reports and Settings tabs are added incrementally as their respective
 * build steps (8 through 13) are approved, to keep every step's diff
 * focused. Attendance (Step 7) is the first of those to ship.
 */
export default function AppLayout() {
  const theme = useAppTheme();
  const role = useAuthStore((s) => s.user?.role);
  const isLabour = role === "labour";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.tabBarBackground, borderTopColor: theme.border },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="workers"
        options={{
          title: "Workers",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          // Labour accounts only see their own attendance/salary (once
          // Step 13 links a login to a worker row) — no roster access.
          href: isLabour ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendance",
          tabBarIcon: ({ color, size }) => <CalendarCheck color={color} size={size} />,
          // Labour sees a restricted placeholder inside the screen itself
          // (see app/(app)/attendance/index.tsx) rather than a hidden tab,
          // since this is where their own attendance will surface once
          // Step 13's worker-login link exists.
        }}
      />
    </Tabs>
  );
}
