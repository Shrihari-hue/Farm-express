import path from "node:path";

/**
 * Root directory for locally-stored uploads (replaces the Supabase Storage
 * `worker-photos` bucket). Resolves to `server/uploads` whether running from
 * `src` (tsx/ts-node dev mode) or `dist` (compiled build) — both are exactly
 * one directory below the `server/` project root.
 */
export const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");
