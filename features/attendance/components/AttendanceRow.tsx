import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { Avatar, Card, Input, Text } from "@components/ui";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing } from "@constants/theme";
import { formatCurrency } from "@utils/formatters";
import type { AttendanceStatus } from "@constants/config";
import type { Attendance, Worker } from "@types/models";
import { StatusChip } from "./StatusChip";

const ALL_STATUSES: AttendanceStatus[] = ["present", "absent", "half_day", "leave", "late"];

interface Props {
  worker: Worker;
  attendance: Attendance | undefined;
  onMark: (status: AttendanceStatus, extra: { todaysWage: number | null; workDone: string | null }) => void;
  isSaving?: boolean;
}

/**
 * One row per worker on the daily marking screen. Tapping a status pill
 * marks attendance immediately (no separate "save" step). Casual workers get
 * an expandable "Today's Wage" + "Work done" section, since their pay is
 * computed per-day rather than off a fixed monthly salary (Step 8).
 */
export function AttendanceRow({ worker, attendance, onMark }: Props) {
  const theme = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const [wageText, setWageText] = useState(
    attendance?.todaysWage != null ? String(attendance.todaysWage) : worker.dailyWage != null ? String(worker.dailyWage) : "",
  );
  const [workDone, setWorkDone] = useState(attendance?.workDone ?? "");

  const isCasual = worker.type === "casual";

  const handleSelectStatus = (status: AttendanceStatus) => {
    const parsedWage = wageText.trim() ? Number(wageText) : null;
    onMark(status, {
      todaysWage: isCasual ? (Number.isFinite(parsedWage) ? parsedWage : null) : null,
      workDone: isCasual ? workDone.trim() || null : null,
    });
  };

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <Avatar name={worker.name} imageUrl={worker.photoUrl} size={40} />
        <View style={styles.nameCol}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {worker.name}
          </Text>
          <Text variant="caption" color="secondary">
            {isCasual
              ? worker.dailyWage != null
                ? `${formatCurrency(worker.dailyWage)} / day`
                : "Casual"
              : "Permanent"}
          </Text>
        </View>
        {isCasual ? (
          <Pressable
            onPress={() => setExpanded((v) => !v)}
            accessibilityLabel={expanded ? "Collapse day details" : "Expand day details"}
            hitSlop={8}
          >
            {expanded ? (
              <ChevronUp size={18} color={theme.textSecondary} />
            ) : (
              <ChevronDown size={18} color={theme.textSecondary} />
            )}
          </Pressable>
        ) : null}
      </View>

      <View style={styles.chipRow}>
        {ALL_STATUSES.map((status) => (
          <StatusChip
            key={status}
            status={status}
            selected={attendance?.status === status}
            onPress={() => handleSelectStatus(status)}
          />
        ))}
      </View>

      {isCasual && expanded ? (
        <View style={styles.detailFields}>
          <Input
            label="Today's wage"
            keyboardType="numeric"
            value={wageText}
            onChangeText={setWageText}
            onBlur={() => attendance ? handleSelectStatus(attendance.status) : undefined}
            placeholder={worker.dailyWage != null ? String(worker.dailyWage) : "0"}
          />
          <Input
            label="Work done"
            value={workDone}
            onChangeText={setWorkDone}
            onBlur={() => (attendance ? handleSelectStatus(attendance.status) : undefined)}
            placeholder="e.g. Harvesting, weeding..."
          />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  topRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  nameCol: { flex: 1, gap: 2 },
  chipRow: { flexDirection: "row", gap: spacing.xs },
  detailFields: { gap: spacing.sm, paddingTop: spacing.xxs },
});
