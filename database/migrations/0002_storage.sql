-- =============================================================================
-- Farm Express — Migration 0002: storage buckets & policies
-- =============================================================================
-- Mirrors storage.sql. Frozen once applied — future storage changes land as
-- a new 0003_*.sql migration.
-- =============================================================================

-- =============================================================================
-- Farm Express — Storage buckets & policies (Step 6)
-- =============================================================================
-- Every farm-scoped file lives under a `{farm_id}/...` path prefix in its
-- bucket; `storage.foldername(name)` splits that path so policies can reuse
-- the exact same `current_farm_id()`/`current_role()` helpers from
-- functions.sql (database/functions.sql) instead of inventing new logic.
--
-- `worker-photos` — permanent/casual worker profile photos (Step 6).
-- Public read (photos are shown in lists via a plain URL, no signed-URL
-- juggling needed) but writes are farm-scoped and role-gated exactly like
-- every other table.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('worker-photos', 'worker-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "worker_photos_public_read" on storage.objects;
create policy "worker_photos_public_read" on storage.objects
  for select
  using (bucket_id = 'worker-photos');

drop policy if exists "worker_photos_insert" on storage.objects;
create policy "worker_photos_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'worker-photos'
    and (storage.foldername(name))[1] = public.current_farm_id()::text
    and public.current_role() in ('owner', 'supervisor')
  );

drop policy if exists "worker_photos_update" on storage.objects;
create policy "worker_photos_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'worker-photos'
    and (storage.foldername(name))[1] = public.current_farm_id()::text
    and public.current_role() in ('owner', 'supervisor')
  );

drop policy if exists "worker_photos_delete" on storage.objects;
create policy "worker_photos_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'worker-photos'
    and (storage.foldername(name))[1] = public.current_farm_id()::text
    and public.current_role() in ('owner', 'supervisor')
  );
