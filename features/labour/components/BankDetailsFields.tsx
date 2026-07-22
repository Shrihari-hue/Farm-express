import React from "react";
import { StyleSheet, View } from "react-native";
import { Controller, type Control } from "react-hook-form";
import { spacing } from "@constants/theme";
import { Input, Text } from "@components/ui";
import type { WorkerFormSchema } from "../schemas";

interface Props {
  control: Control<WorkerFormSchema>;
}

/** Optional bank details for permanent workers — used later for salary
 * slips (Step 8). Every field is optional; owners can fill these in
 * whenever they have the details on hand. */
export function BankDetailsFields({ control }: Props) {
  return (
    <View style={styles.container}>
      <Text variant="label" color="secondary">
        Bank details (optional)
      </Text>

      <Controller
        control={control}
        name="bankDetails.accountHolder"
        render={({ field }) => (
          <Input
            label="Account holder name"
            value={field.value ?? ""}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="bankDetails.accountNumber"
        render={({ field }) => (
          <Input
            label="Account number"
            keyboardType="number-pad"
            value={field.value ?? ""}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <View style={styles.row}>
        <View style={styles.half}>
          <Controller
            control={control}
            name="bankDetails.ifsc"
            render={({ field }) => (
              <Input
                label="IFSC code"
                autoCapitalize="characters"
                value={field.value ?? ""}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </View>
        <View style={styles.half}>
          <Controller
            control={control}
            name="bankDetails.branch"
            render={({ field }) => (
              <Input label="Branch" value={field.value ?? ""} onChangeText={field.onChange} onBlur={field.onBlur} />
            )}
          />
        </View>
      </View>
      <Controller
        control={control}
        name="bankDetails.bankName"
        render={({ field }) => (
          <Input label="Bank name" value={field.value ?? ""} onChangeText={field.onChange} onBlur={field.onBlur} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  row: { flexDirection: "row", gap: spacing.sm },
  half: { flex: 1 },
});
