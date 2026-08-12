import { apiClient } from "@services/api/client";
import type { Buyer } from "@app-types/models";

export async function listBuyers(search?: string): Promise<Buyer[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  const { buyers } = await apiClient.get<{ buyers: Buyer[] }>(`/api/buyers${qs}`);
  return buyers;
}

export interface CreateBuyerPayload {
  name: string;
  phone?: string | null;
  address?: string | null;
}

export async function createBuyer(payload: CreateBuyerPayload): Promise<Buyer> {
  const { buyer } = await apiClient.post<{ buyer: Buyer }>("/api/buyers", payload);
  return buyer;
}
