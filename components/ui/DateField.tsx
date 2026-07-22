import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { CalendarDays } from "lucide-react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing } from "@constants/theme";
import { formatDate } from "@utils/formatters";
import { Text } from "./Text";
import { Button } from "./Button";

interface Props {
  label?: string;
  value: string | null; // yyyy-MM-dd
  onChange: (date: string) => void;
  error?: string;
  maxDate?: string;
  minDate?: string;
  placeholder?: string;
}

/** Tap-to-open calendar date picker, built on `react-native-calendars`
 * (already a dependency for Step 7's attendance calendar) rather than
 * adding a second date-picker library. Used for Joining Date here and
 * reusable for any date field in later steps (stock/sales/expense dates). */
export function DateField({
  label,
  value,
  onChange,
  error,
  maxDate,
  minDate,
  placeholder = "Select date",
}: Props) {
  const theme = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="label" color="secondary" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setIsOpen(true)}
        style={[
          styles.field,
          { borderColor: error ? theme.danger : theme.border, backgroundColor: theme.surface },
        ]}
      >
        <CalendarDays size={18} color={theme.textSecondary} />
        <Text variant="body" color={value ? "primary" : "secondary"} style={styles.fieldText}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </Pressable>
      {error ? (
        <Text variant="caption" color="danger" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: theme.surface }]} onPress={(e) => e.stopPropagation()}>
            <Calendar
              current={value ?? undefined}
              maxDate={maxDate}
              minDate={minDate}
              onDayPress={(day) => {
                onChange(day.dateString);
                setIsOpen(false);
              }}
              markedDates={value ? { [value]: { selected: true, selectedColor: theme.primary } } : undefined}
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
  wrapper: { width: "100%" },
  label: { marginBottom: spacing.xxs },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    minHeight: 48,
  },
  fieldText: { flex: 1 },
  error: { marginTop: spacing.xxs },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: {
    width: "100%",
    borderRadius: radii.lg,
    padding: spacing.sm,
  },
  calendar: { borderRadius: radii.md },
});
