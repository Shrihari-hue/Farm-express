import React, { useRef } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useAppTheme } from "@hooks/useAppTheme";
import { radii, spacing } from "@constants/theme";
import { OTP_LENGTH } from "@constants/config";
import { Text } from "@components/ui";

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
}

/**
 * Six-box OTP entry. Implemented as one invisible `TextInput` overlaying
 * styled boxes — far more reliable on both platforms (paste-from-SMS,
 * autofill, backspace handling) than wiring up six separate inputs.
 */
export function OtpInputField({ value, onChange, error, autoFocus = true }: Props) {
  const theme = useAppTheme();
  const inputRef = useRef<TextInput>(null);
  const digits = value.split("");

  return (
    <View>
      <Pressable onPress={() => inputRef.current?.focus()} style={styles.boxRow}>
        {Array.from({ length: OTP_LENGTH }).map((_, index) => {
          const digit = digits[index] ?? "";
          const isActive = index === value.length;
          return (
            <View
              key={index}
              style={[
                styles.box,
                {
                  borderColor: error ? theme.danger : isActive ? theme.primary : theme.border,
                  backgroundColor: theme.surface,
                },
              ]}
            >
              <Text variant="title">{digit}</Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={OTP_LENGTH}
        autoFocus={autoFocus}
        style={styles.hiddenInput}
      />
      {error ? (
        <Text variant="caption" color="danger" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  boxRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.xs },
  box: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 1,
    width: 1,
  },
  error: { marginTop: spacing.xs },
});
