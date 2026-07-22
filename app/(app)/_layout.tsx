import { Tabs } from "expo-router";
import { LayoutGrid } from "lucide-react-native";
import { useAppTheme } from "@hooks/useAppTheme";

/**
 * Authenticated, tab-based experience. Only the Dashboard tab exists for
 * now — Labour, Attendance, Salary, Stock, Sales, Expenses, Reports and
 * Settings tabs are added incrementally as their respective build steps
 * (6 through 13) are approved, to keep every step's diff focused.
 */
export default function AppLayout() {
  const theme = useAppTheme();

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
    </Tabs>
  );
}
