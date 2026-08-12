import type { Schema } from "mongoose";

/**
 * Applies a consistent `toJSON` transform to a Mongoose schema:
 *  - renames `_id` -> `id` (stringified)
 *  - removes the `__v` version key
 *  - optionally strips additional internal-only fields (e.g. `passwordHash` on User)
 *
 * This is what lets every API response match the camelCase `types/models.ts`
 * shape the frontend already expects, with plain string ids instead of ObjectIds.
 */
export function applyIdTransform(schema: Schema, options?: { hide?: string[] }): void {
  schema.set("toJSON", {
    virtuals: false,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      if (ret._id) {
        ret.id = String(ret._id);
      }
      delete ret._id;
      delete ret.__v;
      if (options?.hide) {
        for (const key of options.hide) {
          delete ret[key];
        }
      }
      return ret;
    },
  });
}
