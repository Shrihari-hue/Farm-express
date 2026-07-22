import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { addDays, format, isToday, parseISO } from "date-fns";
import { Button, Text } from "@components/ui";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing } from "@constants/theme";
import { todayISODate } from "@utils/formatters";

interface Props {
  date: string; // yyyy-MM-dd
  onChange: (date: string) => void;
}

/** Date navigation header for the daily marking screen — prev/next arrows
 * step one day at a time, and tapping the date opens a calendar to jump
 * further. Disallows navigating past today, since attendance is marked for
 * the present or the past, never in advance. */
export function DaySwitcher({ date, onChange }: Props) {
  const theme = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);
  const parsed = parseISO(date);
  const today = todayISODate();
  const isCurrentDay = isToday(parsed);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange(format(addDays(parsed, -1), "yyyy-MM-dd"))}
        style={styles.arrow}
        accessibilityLabel="Previous day"
        hitSlop={8}
      >
        <ChevronLeft size={20} color={theme.textPrimary} />
      </Pressable>

      <Pressable onPress={() => setIsOpen(true)} style={styles.dateButton}>
        <Text variant="bodyStrong">{format(parsed, "EEE, dd MMM yyyy")}</Text>
        {isCurrentDay ? (
          <Text variant="caption" color="brand">
            Today
          </Text>
        ) : null}
      </Pressable>

      <Pressable
        onPress={() => onChange(format(addDays(parsed, 1), "yyyy-MM-dd"))}
        style={[styles.arrow, date >= today && styles.arrowDisabled]}
        accessibilityLabel="Next day"
        disabled={date >= today}
        hitSlop={8}
      >
        <ChevronRight size={20} color={date >= today ? theme.border : theme.textPrimary} />
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: theme.surface }]} onPress={(e) => e.stopPropagation()}>
            <Calendar
              current={date}
              maxDate={today}
              onDayPress={(day) => {
                onChange(day.dateString);
                setIsOpen(false);
              }}
              markedDates={{ [date]: { selected: true, selectedColor: theme.primary } }}
              theme={{
                calendarBackground: theme.surface,
                dayTextColor: theme.textPrimary,
                monthTextColor: theme.textPrimary,
                textDisabledColor: theme.border,
                arrowColor: theme.primary,
                todayTextColor: theme.primary,
                selectedDayBackgroundColor: theme.primary,
              }}
              style={styles.calendar}
            />
            <Button label="Close" variant="ghost" onPress={() => setIsOpen(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  arrow: { padding: spacing.xs },
  arrowDisabled: { opacity: 0.4 },
  dateButton: { alignItems: "center", flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: { width: "100%", borderRadius: radii.lg, padding: spacing.sm },
  calendar: { borderRadius: radii.md },
});
