import { apiClient } from "@services/api/client";
import type { Farm } from "@app-types/models";

export async function getFarm(farmId: string): Promise<Farm | null> {
  try {
    const { farm } = await apiClient.get<{ farm: Farm }>(`/api/farms/${encodeURIComponent(farmId)}`);
    return farm;
  } catch (error) {
    // Mirrors the old `.maybeSingle()` behaviour: a missing farm resolves to
    // `null` instead of throwing. Any other error (network, auth, etc.)
    // still propagates so TanStack Query surfaces a real error state.
    if (error instanceof Error && /not found/i.test(error.message)) {
      return null;
    }
    throw error;
  }
}
