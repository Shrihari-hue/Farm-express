import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { ErrorState, Screen } from "@components/ui";
import { spacing } from "@constants/theme";
import { useAuthStore } from "@services/state/authStore";
import { useUpdateWorker, useWorkerQuery } from "@features/labour/hooks/useWorkers";
import { WorkerForm } from "@features/labour/components/WorkerForm";
import { isLocalFileUri, uploadImageAsync } from "@services/supabase/storage";
import type { WorkerFormValues } from "@features/labour/types";
import type { WorkerFormSchema } from "@features/labour/schemas";

export default function EditWorkerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const farmId = user?.farmId ?? "";
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const { data: worker, isLoading, isError, refetch } = useWorkerQuery(id);
  const updateWorker = useUpdateWorker(farmId, id ?? "");

  if (isLoading || !worker) {
    return isError ? (
      <Screen>
        <ErrorState message="Couldn't load this worker." onRetry={refetch} />
      </Screen>
    ) : null;
  }

  const initialValues: WorkerFormValues = {
    type: worker.type,
    name: worker.name,
    phone: worker.phone ?? "",
    address: worker.address ?? "",
    village: worker.village ?? "",
    joiningDate: worker.joiningDate,
    monthlySalary: worker.monthlySalary != null ? String(worker.monthlySalary) : "",
    dailyWage: worker.dailyWage != null ? String(worker.dailyWage) : "",
    bankDetails: worker.bankDetails ?? {},
    notes: worker.notes ?? "",
    photoUri: worker.photoUrl,
  };

  const handleSubmit = async (values: WorkerFormSchema) => {
    try {
      let photoUrl = worker.photoUrl;
      if (isLocalFileUri(values.photoUri)) {
        setIsUploadingPhoto(true);
        try {
          photoUrl = await uploadImageAsync({
            bucket: "worker-photos",
            path: `${farmId}/${worker.id}.jpg`,
            localUri: values.photoUri,
          });
        } finally {
          setIsUploadingPhoto(false);
        }
      }

      await updateWorker.mutateAsync({
        name: values.name,
        phone: values.phone || null,
        address: values.type === "permanent" ? values.address || null : null,
        village: values.type === "casual" ? values.village || null : null,
        joiningDate: values.type === "permanent" ? values.joiningDate : null,
        monthlySalary: values.type === "permanent" ? Number(values.monthlySalary) : null,
        dailyWage: values.type === "casual" ? Number(values.dailyWage) : null,
        bankDetails: values.type === "permanent" ? values.bankDetails : {},
        notes: values.notes || null,
        photoUrl,
      });

      Toast.show({ type: "success", text1: "Worker updated" });
      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Couldn't update worker",
        text2: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <Screen scroll contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
      <WorkerForm
        initialValues={initialValues}
        lockType
        isSubmitting={updateWorker.isPending || isUploadingPhoto}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />
    </Screen>
  );
}
