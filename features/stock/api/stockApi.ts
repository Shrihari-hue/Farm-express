import { apiClient } from "@services/api/client";
import type { StockCategory } from "@constants/config";
import type { StockHistoryEntry, StockItem } from "@app-types/models";

export interface CreateStockItemPayload {
  category: StockCategory;
  name: string;
  unit: string;
  quantity?: number;
  location?: string | null;
  lowStockThreshold?: number | null;
}

export async function listStockItems(category?: StockCategory): Promise<StockItem[]> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  const { stockItems } = await apiClient.get<{ stockItems: StockItem[] }>(`/api/stock${qs}`);
  return stockItems;
}

export async function getStockItem(id: string): Promise<StockItem> {
  const { stockItem } = await apiClient.get<{ stockItem: StockItem }>(`/api/stock/${encodeURIComponent(id)}`);
  return stockItem;
}

export async function createStockItem(payload: CreateStockItemPayload): Promise<StockItem> {
  const { stockItem } = await apiClient.post<{ stockItem: StockItem }>("/api/stock", payload);
  return stockItem;
}

export interface UpdateStockItemPayload {
  name?: string;
  unit?: string;
  location?: string | null;
  lowStockThreshold?: number | null;
}

export async function updateStockItem(id: string, payload: UpdateStockItemPayload): Promise<StockItem> {
  const { stockItem } = await apiClient.patch<{ stockItem: StockItem }>(
    `/api/stock/${encodeURIComponent(id)}`,
    payload,
  );
  return stockItem;
}

export async function deleteStockItem(id: string): Promise<void> {
  await apiClient.del<void>(`/api/stock/${encodeURIComponent(id)}`);
}

export async function getStockHistory(
  stockItemId: string,
  startDate: string,
  endDate: string,
): Promise<StockHistoryEntry[]> {
  const { history } = await apiClient.get<{ history: StockHistoryEntry[] }>(
    `/api/stock/${encodeURIComponent(stockItemId)}/history?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
  );
  return history;
}

export interface LogStockHistoryPayload {
  stockItemId: string;
  date: string;
  harvestedToday: number;
  soldToday: number;
  damaged: number;
  notes: string | null;
}

/** Upserts one day's harvest/sold/damaged entry for a stock item — the
 * server recomputes remainingStock and syncs it onto the item's live
 * quantity, mirroring how `markAttendance` upserts on `(workerId, date)`. */
export async function logStockHistory(
  payload: LogStockHistoryPayload,
): Promise<{ historyEntry: StockHistoryEntry; stockItem: StockItem }> {
  return apiClient.put<{ historyEntry: StockHistoryEntry; stockItem: StockItem }>(
    `/api/stock/${encodeURIComponent(payload.stockItemId)}/history`,
    {
      date: payload.date,
      harvestedToday: payload.harvestedToday,
      soldToday: payload.soldToday,
      damaged: payload.damaged,
      notes: payload.notes,
    },
  );
}
