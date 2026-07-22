import React from "react";
import { StyleSheet, View } from "react-native";
import { VictoryAxis, VictoryChart, VictoryGroup, VictoryBar } from "victory-native";
import { format, parseISO } from "date-fns";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing } from "@constants/theme";
import { Card, Skeleton, Text } from "@components/ui";
import type { DailyTrendPoint } from "../api/dashboardApi";

interface Props {
  data: DailyTrendPoint[] | undefined;
  isLoading: boolean;
}

/** 7-day sales vs expenses comparison. Renders a real (if currently flat)
 * chart from day one — it fills in naturally once Sales (Step 10) and
 * Expenses (Step 11) start recording data. */
export function WeeklyTrendChart({ data, isLoading }: Props) {
  const theme = useAppTheme();

  if (isLoading || !data) {
    return (
      <Card style={styles.card}>
        <Text variant="bodyStrong" style={styles.heading}>
          Sales vs. expenses (7 days)
        </Text>
        <Skeleton width="100%" height={180} />
      </Card>
    );
  }

  const hasAnyValue = data.some((point) => point.sales > 0 || point.expenses > 0);

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text variant="bodyStrong">Sales vs. expenses (7 days)</Text>
        <View style={styles.legend}>
          <LegendDot color={theme.success} label="Sales" />
          <LegendDot color={theme.danger} label="Expenses" />
        </View>
      </View>

      {!hasAnyValue ? (
        <Text variant="caption" color="secondary" style={styles.emptyNote}>
          No sales or expenses recorded this week yet — this chart fills in automatically once you start
          logging them.
        </Text>
      ) : null}

      <VictoryChart
        height={200}
        domainPadding={{ x: 18 }}
        padding={{ top: 8, bottom: 28, left: 40, right: 12 }}
      >
        <VictoryAxis
          tickFormat={(t: string) => format(parseISO(t), "EEE")}
          style={{
            axis: { stroke: theme.border },
            tickLabels: { fill: theme.textSecondary, fontSize: 10 },
            grid: { stroke: "transparent" },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t: number) => (t >= 1000 ? `${Math.round(t / 1000)}k` : `${t}`)}
          style={{
            axis: { stroke: "transparent" },
            tickLabels: { fill: theme.textSecondary, fontSize: 10 },
            grid: { stroke: theme.border, strokeDasharray: "4,4" },
          }}
        />
        <VictoryGroup offset={10}>
          <VictoryBar
            data={data}
            x="date"
            y="sales"
            style={{ data: { fill: theme.success, width: 8 } }}
            cornerRadius={{ top: 2 }}
          />
          <VictoryBar
            data={data}
            x="date"
            y="expenses"
            style={{ data: { fill: theme.danger, width: 8 } }}
            cornerRadius={{ top: 2 }}
          />
        </VictoryGroup>
      </VictoryChart>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text variant="caption" color="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  heading: {},
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  legend: { flexDirection: "row", gap: spacing.sm },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  emptyNote: { marginBottom: -spacing.xs },
});
