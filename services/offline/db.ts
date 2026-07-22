import * as SQLite from "expo-sqlite";

/**
 * Local SQLite database used for offline writes. Any mutation performed
 * without connectivity (marking attendance, entering stock, recording a
 * sale, etc.) is written here first, queued in `mutation_queue`, and then
 * replayed against Supabase by `syncEngine.ts` once the network returns.
 *
 * Feature modules should not open their own SQLite connections — always go
 * through `getDb()` so we have exactly one connection for the app lifetime.
 */
let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync("farm-express.db");
  }
  return dbInstance;
}

/** Creates the local mirror tables + the outbox queue. Safe to call on
 * every app start — every statement is idempotent (`IF NOT EXISTS`). */
export function initOfflineDatabase(): void {
  const db = getDb();

  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS mutation_queue (
      id TEXT PRIMARY KEY NOT NULL,
      entity_type TEXT NOT NULL,
      operation TEXT NOT NULL CHECK (operation IN ('insert', 'update', 'delete')),
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_mutation_queue_created_at
      ON mutation_queue (created_at);

    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );
  `);
}
