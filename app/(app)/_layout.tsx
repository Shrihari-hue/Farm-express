import { Tabs } from "expo-router";
import { CalendarCheck, LayoutGrid, PackageSearch, Receipt, ShoppingCart, Users } from "lucide-react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { useAuthStore } from "@services/state/authStore";

/**
 * Authenticated, tab-based experience. Salary, Reports and Settings tabs are
 * still to come — Dashboard, Workers, Attendance, Stock, Sales and Expenses
 * are the modules built so far. Labour accounts get the same tabs as
 * supervisor except Workers (roster/payroll management stays owner+
 * supervisor-only — see PERMISSIONS.MANAGE_WORKERS).
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
          href: isLabour ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendance",
          tabBarIcon: ({ color, size }) => <CalendarCheck color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          title: "Stock",
          tabBarIcon: ({ color, size }) => <PackageSearch color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: "Sales",
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({ color, size }) => <Receipt color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
