# database/

Plain, version-controlled SQL — the source of truth for the schema, not the
Supabase dashboard.

- `schema.sql` — 14 farm-scoped tables + a `roles` reference table. FKs,
  `check` constraints and indexes live here, not just in app-level validation.
- `functions.sql` — `current_farm_id()`/`current_role()` helpers used by
  every RLS policy, `handle_new_user` (creates a `public.users` row the
  instant someone verifies their first OTP), `set_updated_at` triggers, and
  the `complete_owner_profile` RPC the app calls from the "complete profile"
  screen.
- `policies.sql` — Row Level Security for every table. This is what actually
  enforces the multi-tenant boundary and the owner/supervisor/labour
  permission matrix — not app-level query filtering.
- `seed.sql` — deliberately does *not* insert fake farms/users (there's no
  safe way to fabricate an `auth.users` row from SQL); it documents how to
  seed realistic data once you've signed up for real in a dev project.
- `storage.sql` — Supabase Storage buckets + RLS on `storage.objects`.
  `worker-photos` (Step 6) reuses `current_farm_id()`/`current_role()` via
  `storage.foldername(name)`, so a photo's path prefix (`{farm_id}/...`) is
  the security boundary, exactly like every table's `farm_id` column.
- `migrations/` — the frozen, applied snapshots of the files above, in the
  form the Supabase CLI actually runs (`npx supabase db push`):
  `0001_init.sql` (schema + functions + policies), `0002_storage.sql`
  (storage buckets + policies). Once applied anywhere, a migration file is
  never edited — schema changes land as a new `000N_*.sql`, with the
  relevant source file (`schema.sql`/`functions.sql`/`policies.sql`/
  `storage.sql`) updated to match so they stay the reviewable "current
  state" reference.
