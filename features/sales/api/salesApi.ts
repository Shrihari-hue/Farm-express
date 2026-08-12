import { apiClient } from "@services/api/client";
import type { PaymentMethod } from "@constants/config";
import type { Sale } from "@app-types/models";

export async function listSales(startDate: string, endDate: string): Promise<Sale[]> {
  const { sales } = await apiClient.get<{ sales: Sale[] }>(
    `/api/sales?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
  );
  return sales;
}

export interface RecordSalePayload {
  stockItemId: string;
  buyerId: string;
  quantity: number;
  rate: number;
  transportCost: number;
  commission: number;
  paymentMethod: PaymentMethod;
  date: string;
  remarks: string | null;
}

export async function recordSale(payload: RecordSalePayload): Promise<Sale> {
  const { sale } = await apiClient.post<{ sale: Sale }>("/api/sales", payload);
  return sale;
}

export async function deleteSale(id: string): Promise<void> {
  await apiClient.del<void>(`/api/sales/${encodeURIComponent(id)}`);
}
