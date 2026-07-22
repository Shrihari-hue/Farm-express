import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react-native";
import { spacing } from "@constants/theme";
import { useAppTheme } from "@hooks/useAppTheme";
import { Avatar, Button, DateField, Input, SegmentedControl, Text } from "@components/ui";
import { PHONE_COUNTRY_CODE } from "@constants/config";
import { workerFormSchema, type WorkerFormSchema } from "../schemas";
import { BankDetailsFields } from "./BankDetailsFields";
import { EMPTY_WORKER_FORM, type WorkerFormValues } from "../types";

interface Props {
  initialValues?: WorkerFormValues;
  /** True when editing an existing worker — locks the Permanent/Casual
   * toggle, since changing category after the fact would orphan salary
   * history and doesn't reflect a real-world scenario. */
  lockType?: boolean;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (values: WorkerFormSchema) => void;
}

export function WorkerForm({ initialValues, lockType, isSubmitting, submitLabel, onSubmit }: Props) {
  const theme = useAppTheme();
  const { control, handleSubmit, watch, setValue } = useForm<WorkerFormSchema>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: initialValues ?? EMPTY_WORKER_FORM,
  });

  const type = watch("type");
  const photoUri = watch("photoUri");
  const name = watch("name");

  const pickPhoto = async () => {
    Alert.alert("Worker photo", "Choose a source", [
      { text: "Take photo", onPress: () => launchCamera() },
      { text: "Choose from library", onPress: () => launchLibrary() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const launchCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera access needed", "Enable camera access in Settings to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, aspect: [1, 1], allowsEditing: true });
    if (!result.canceled && result.assets[0]) {
      setValue("photoUri", result.assets[0].uri, { shouldDirty: true });
    }
  };

  const launchLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo access needed", "Enable photo library access in Settings to choose a photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      aspect: [1, 1],
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled && result.assets[0]) {
      setValue("photoUri", result.assets[0].uri, { shouldDirty: true });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.photoRow}>
        <Avatar name={name || "?"} imageUrl={photoUri} size={72} />
        <Button label="Change photo" variant="secondary" size="sm" icon={<Camera size={16} color={theme.primary} />} onPress={pickPhoto} />
      </View>

      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <View>
            {lockType ? (
              <Text variant="caption" color="secondary" style={styles.lockedTypeLabel}>
                {field.value === "permanent" ? "Permanent labour" : "Casual labour"}
              </Text>
            ) : (
              <SegmentedControl
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "permanent", label: "Permanent" },
                  { value: "casual", label: "Casual" },
                ]}
              />
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <Input
            label="Full name"
            placeholder="e.g. Manjunath K"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <Input
            label="Phone number"
            placeholder="98765 43210"
            keyboardType="number-pad"
            maxLength={10}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            leftIcon={<Text color="secondary">{PHONE_COUNTRY_CODE}</Text>}
          />
        )}
      />

      {type === "permanent" ? (
        <>
          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <Input
                label="Address"
                placeholder="House, street, village"
                multiline
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            control={control}
            name="joiningDate"
            render={({ field }) => (
              <DateField
                label="Joining date"
                value={field.value}
                onChange={field.onChange}
                maxDate={new Date().toISOString().slice(0, 10)}
              />
            )}
          />
          <Controller
            control={control}
            name="monthlySalary"
            render={({ field, fieldState }) => (
              <Input
                label="Monthly salary"
                placeholder="e.g. 12000"
                keyboardType="decimal-pad"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                leftIcon={<Text color="secondary">₹</Text>}
              />
            )}
          />
          <BankDetailsFields control={control} />
        </>
      ) : (
        <>
          <Controller
            control={control}
            name="village"
            render={({ field }) => (
              <Input
                label="Village"
                placeholder="e.g. Kadaba"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            control={control}
            name="dailyWage"
            render={({ field, fieldState }) => (
              <Input
                label="Daily wage"
                placeholder="e.g. 450"
                keyboardType="decimal-pad"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                leftIcon={<Text color="secondary">₹</Text>}
              />
            )}
          />
        </>
      )}

      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <Input
            label="Notes"
            placeholder="Anything worth remembering about this worker"
            multiline
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <Button label={submitLabel} onPress={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth style={styles.submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  photoRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  lockedTypeLabel: { textTransform: "uppercase", letterSpacing: 0.5 },
  submit: { marginTop: spacing.xs },
});
