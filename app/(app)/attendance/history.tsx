import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { router } from "expo-router";
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import { Card, Screen, Text } from "@components/ui";
import { spacing } from "@constants/theme";
import { useAppTheme } from "@hooks/useAppTheme";
import { useAuthStore } from "@services/state/authStore";
import { todayISODate } from "@utils/formatters";
import { useMonthAttendanceOverview } from "@features/attendance/hooks/useAttendance";

/** Calendar view of a farm's marked attendance days — a dot on any day that
 * has at least one attendance entry, colored green when everyone active
 * that day was marked present. Tapping a date jumps to the daily marking
 * screen for that date. */
export default function AttendanceHistoryScreen() {
  const theme = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const farmId = user?.farmId ?? "";
  const [visibleMonth, setVisibleMonth] = useState(todayISODate());

  const monthStart = format(startOfMonth(new Date(visibleMonth)), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(new Date(visibleMonth)), "yyyy-MM-dd");

  const { byDate, isLoading } = useMonthAttendanceOverview(farmId, monthStart, monthEnd);

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked: boolean; dotColor: string }> = {};
    for (const [date, entry] of byDate.entries()) {
      const allPresent = entry.presentCount === entry.markedCount;
      marks[date] = { marked: true, dotColor: allPresent ? theme.success : theme.warning };
    }
    return marks;
  }, [byDate, theme]);

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <Card>
        <Calendar
          current={visibleMonth}
          maxDate={todayISODate()}
          markedDates={markedDates}
          onDayPress={(day: DateData) => {
            router.push({ pathname: "/(app)/attendance", params: { date: day.dateString } });
          }}
          onMonthChange={(month) => setVisibleMonth(format(new Date(month.dateString), "yyyy-MM-dd"))}
          theme={{
            calendarBackground: theme.surface,
            dayTextColor: theme.textPrimary,
            monthTextColor: theme.textPrimary,
            textDisabledColor: theme.border,
            arrowColor: theme.primary,
            todayTextColor: theme.primary,
          }}
        />
      </Card>

      <View style={styles.legend}>
        <LegendDot color={theme.success} label="Everyone marked present" />
        <LegendDot color={theme.warning} label="Some absences/leave/half-day" />
      </View>

      {isLoading ? (
        <Text variant="caption" color="secondary">
          Loading month overview...
        </Text>
      ) : null}

      <Text variant="caption" color="secondary">
        Tap any date to view or edit that day's attendance. Jumping more than a month back or
        forward uses the calendar's own month arrows.
      </Text>
    </Screen>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="caption" color="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xxl },
  legend: { gap: spacing.xs },
  legendRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
