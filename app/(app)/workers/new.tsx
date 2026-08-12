import { useState } from "react";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { Screen } from "@components/ui";
import { spacing } from "@constants/theme";
import { queryKeys } from "@services/query/queryClient";
import { useAuthStore } from "@services/state/authStore";
import { useCreateWorker } from "@features/labour/hooks/useWorkers";
import { updateWorker } from "@features/labour/api/workersApi";
import { WorkerForm } from "@features/labour/components/WorkerForm";
import { isLocalFileUri, uploadWorkerPhoto } from "@services/api/uploads";
import type { WorkerFormSchema } from "@features/labour/schemas";

/**
 * A worker's photo is uploaded to a path keyed by its id (see
 * database/storage.sql), so creation is two steps: insert the row, then —
 * only if a photo was picked — upload it and patch `photo_url` in. This
 * screen (not the `useCreateWorker`/`useUpdateWorker` hooks) owns that
 * orchestration since it's specific to "create" and doesn't belong in the
 * reusable mutation hooks.
 */
export default function NewWorkerScreen() {
  const user = useAuthStore((s) => s.user);
  const farmId = user?.farmId ?? "";
  const queryClient = useQueryClient();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const createWorker = useCreateWorker(farmId);

  const handleSubmit = async (values: WorkerFormSchema) => {
    try {
      const worker = await createWorker.mutateAsync({
        farmId,
        type: values.type,
        name: values.name,
        phone: values.phone || null,
        address: values.type === "permanent" ? values.address || null : null,
        village: values.type === "casual" ? values.village || null : null,
        joiningDate: values.type === "permanent" ? values.joiningDate : null,
        monthlySalary: values.type === "permanent" ? Number(values.monthlySalary) : null,
        dailyWage: values.type === "casual" ? Number(values.dailyWage) : null,
        bankDetails: values.type === "permanent" ? values.bankDetails : {},
        notes: values.notes || null,
      });

      if (isLocalFileUri(values.photoUri)) {
        setIsUploadingPhoto(true);
        try {
          const photoUrl = await uploadWorkerPhoto(worker.id, values.photoUri);
          await updateWorker(worker.id, { photoUrl });
          queryClient.invalidateQueries({ queryKey: queryKeys.worker(worker.id) });
        } finally {
          setIsUploadingPhoto(false);
        }
      }

      Toast.show({ type: "success", text1: "Worker added", text2: values.name });
      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Couldn't save worker",
        text2: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <Screen scroll contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
      <WorkerForm
        isSubmitting={createWorker.isPending || isUploadingPhoto}
        submitLabel="Add worker"
        onSubmit={handleSubmit}
      />
    </Screen>
  );
}
