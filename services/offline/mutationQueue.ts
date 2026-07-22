import uuid from "react-native-uuid";
import { getDb } from "./db";

export type QueuedOperation = "insert" | "update" | "delete";

export interface QueuedMutation<T = Record<string, unknown>> {
  id: string;
  entityType: string;
  operation: QueuedOperation;
  payload: T;
  createdAt: string;
  attempts: number;
  lastError: string | null;
}

/** Adds a mutation to the local outbox. Call this from feature-level
 * repositories whenever a write happens while offline (or optimistically,
 * always — the sync engine simply no-ops if the row was already synced). */
export function enqueueMutation(
  entityType: string,
  operation: QueuedOperation,
  payload: Record<string, unknown>,
): void {
  const db = getDb();
  const id = uuid.v4() as string;
  db.runSync(
    `INSERT INTO mutation_queue (id, entity_type, operation, payload, created_at, attempts)
     VALUES (?, ?, ?, ?, ?, 0);`,
    [id, entityType, operation, JSON.stringify(payload), new Date().toISOString()],
  );
}

export function getPendingMutations(limit = 50): QueuedMutation[] {
  const db = getDb();
  const rows = db.getAllSync<{
    id: string;
    entity_type: string;
    operation: QueuedOperation;
    payload: string;
    created_at: string;
    attempts: number;
    last_error: string | null;
  }>(`SELECT * FROM mutation_queue ORDER BY created_at ASC LIMIT ?;`, [limit]);

  return rows.map((row) => ({
    id: row.id,
    entityType: row.entity_type,
    operation: row.operation,
    payload: JSON.parse(row.payload),
    createdAt: row.created_at,
    attempts: row.attempts,
    lastError: row.last_error,
  }));
}

export function removeMutation(id: string): void {
  getDb().runSync(`DELETE FROM mutation_queue WHERE id = ?;`, [id]);
}

export function markMutationFailed(id: string, error: string): void {
  getDb().runSync(
    `UPDATE mutation_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?;`,
    [error, id],
  );
}

export function countPendingMutations(): number {
  const db = getDb();
  const row = db.getFirstSync<{ count: number }>(`SELECT COUNT(*) as count FROM mutation_queue;`);
  return row?.count ?? 0;
}
