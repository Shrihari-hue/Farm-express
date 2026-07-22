-- =============================================================================
-- Farm Express — Row Level Security (Step 4)
-- =============================================================================
-- Every farm-scoped table: readable by anyone belonging to that farm,
-- writable by owner/supervisor (per constants/config.ts's PERMISSIONS
-- matrix), deletable by owner only. `stock_history` and `activity_logs` are
-- append-only — intentionally no UPDATE/DELETE policy exists for them, so
-- even the owner can only INSERT/SELECT, matching "history should never be
-- deleted".
--
-- `current_farm_id()` / `current_role()` (functions.sql) read the caller's
-- own profile row once per statement; keeping that logic in one place means
-- a future role (e.g. "accountant") is a one-function change, not a
-- 15-policy rewrite.
-- =============================================================================

alter table public.roles enable row level security;
alter table public.farms enable row level security;
alter table public.users enable row level security;
alter table public.workers enable row level security;
alter table public.attendance enable row level security;
alter table public.salary_advances enable row level security;
alter table public.salary_payments enable row level security;
alter table public.stock enable row level security;
alter table public.stock_history enable row level security;
alter table public.buyers enable row level security;
alter table public.sales enable row level security;
alter table public.expenses enable row level security;
alter table public.notifications enable row level security;
alter table public.settings enable row level security;
alter table public.activity_logs enable row level security;

-- -----------------------------------------------------------------------------
-- roles — public reference data, read-only to every signed-in user
-- -----------------------------------------------------------------------------
drop policy if exists "roles_select_authenticated" on public.roles;
create policy "roles_select_authenticated" on public.roles
  for select to authenticated using (true);

-- -----------------------------------------------------------------------------
-- farms
-- -----------------------------------------------------------------------------
drop policy if exists "farms_select_own" on public.farms;
create policy "farms_select_own" on public.farms
  for select to authenticated
  using (id = public.current_farm_id() or owner_id = auth.uid());

drop policy if exists "farms_update_owner" on public.farms;
create policy "farms_update_owner" on public.farms
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- No INSERT policy: farms are only created via the `complete_owner_profile`
-- SECURITY DEFINER RPC, which bypasses RLS by design.

-- -----------------------------------------------------------------------------
-- users — everyone can see their own row + co-workers on the same farm;
-- only the owner can change someone else's role.
-- -----------------------------------------------------------------------------
drop policy if exists "users_select_self_or_farm" on public.users;
create policy "users_select_self_or_farm" on public.users
  for select to authenticated
  using (id = auth.uid() or farm_id = public.current_farm_id());

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self" on public.users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "users_update_by_owner" on public.users;
create policy "users_update_by_owner" on public.users
  for update to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() = 'owner')
  with check (farm_id = public.current_farm_id());

-- -----------------------------------------------------------------------------
-- workers
-- -----------------------------------------------------------------------------
drop policy if exists "workers_select" on public.workers;
create policy "workers_select" on public.workers
  for select to authenticated using (farm_id = public.current_farm_id());

drop policy if exists "workers_write" on public.workers;
create policy "workers_write" on public.workers
  for insert to authenticated
  with check (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'));

drop policy if exists "workers_update" on public.workers;
create policy "workers_update" on public.workers
  for update to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'))
  with check (farm_id = public.current_farm_id());

drop policy if exists "workers_delete" on public.workers;
create policy "workers_delete" on public.workers
  for delete to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() = 'owner');

-- -----------------------------------------------------------------------------
-- attendance — labour can only ever see rows for their own linked worker
-- -----------------------------------------------------------------------------
drop policy if exists "attendance_select" on public.attendance;
create policy "attendance_select" on public.attendance
  for select to authenticated
  using (
    farm_id = public.current_farm_id()
    and (
      public.current_role() in ('owner', 'supervisor')
      or worker_id in (select id from public.workers where user_id = auth.uid())
    )
  );

drop policy if exists "attendance_write" on public.attendance;
create policy "attendance_write" on public.attendance
  for insert to authenticated
  with check (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'));

drop policy if exists "attendance_update" on public.attendance;
create policy "attendance_update" on public.attendance
  for update to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'))
  with check (farm_id = public.current_farm_id());

drop policy if exists "attendance_delete" on public.attendance;
create policy "attendance_delete" on public.attendance
  for delete to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() = 'owner');

-- -----------------------------------------------------------------------------
-- salary_advances / salary_payments — same "labour sees only their own" rule
-- -----------------------------------------------------------------------------
drop policy if exists "advances_select" on public.salary_advances;
create policy "advances_select" on public.salary_advances
  for select to authenticated
  using (
    farm_id = public.current_farm_id()
    and (
      public.current_role() in ('owner', 'supervisor')
      or worker_id in (select id from public.workers where user_id = auth.uid())
    )
  );

drop policy if exists "advances_write" on public.salary_advances;
create policy "advances_write" on public.salary_advances
  for insert to authenticated
  with check (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'));

drop policy if exists "advances_update" on public.salary_advances;
create policy "advances_update" on public.salary_advances
  for update to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'))
  with check (farm_id = public.current_farm_id());

drop policy if exists "advances_delete" on public.salary_advances;
create policy "advances_delete" on public.salary_advances
  for delete to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() = 'owner');

drop policy if exists "salary_payments_select" on public.salary_payments;
create policy "salary_payments_select" on public.salary_payments
  for select to authenticated
  using (
    farm_id = public.current_farm_id()
    and (
      public.current_role() in ('owner', 'supervisor')
      or worker_id in (select id from public.workers where user_id = auth.uid())
    )
  );

drop policy if exists "salary_payments_write" on public.salary_payments;
create policy "salary_payments_write" on public.salary_payments
  for insert to authenticated
  with check (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'));

drop policy if exists "salary_payments_update" on public.salary_payments;
create policy "salary_payments_update" on public.salary_payments
  for update to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'))
  with check (farm_id = public.current_farm_id());

drop policy if exists "salary_payments_delete" on public.salary_payments;
create policy "salary_payments_delete" on public.salary_payments
  for delete to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() = 'owner');

-- -----------------------------------------------------------------------------
-- stock (current inventory)
-- -----------------------------------------------------------------------------
drop policy if exists "stock_select" on public.stock;
create policy "stock_select" on public.stock
  for select to authenticated using (farm_id = public.current_farm_id());

drop policy if exists "stock_write" on public.stock;
create policy "stock_write" on public.stock
  for insert to authenticated
  with check (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'));

drop policy if exists "stock_update" on public.stock;
create policy "stock_update" on public.stock
  for update to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'))
  with check (farm_id = public.current_farm_id());

drop policy if exists "stock_delete" on public.stock;
create policy "stock_delete" on public.stock
  for delete to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() = 'owner');

-- -----------------------------------------------------------------------------
-- stock_history — append-only: SELECT + INSERT only, no UPDATE, no DELETE,
-- for anyone, including the owner. This is deliberate (see schema.sql).
-- -----------------------------------------------------------------------------
drop policy if exists "stock_history_select" on public.stock_history;
create policy "stock_history_select" on public.stock_history
  for select to authenticated using (farm_id = public.current_farm_id());

drop policy if exists "stock_history_insert" on public.stock_history;
create policy "stock_history_insert" on public.stock_history
  for insert to authenticated
  with check (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'));

-- -----------------------------------------------------------------------------
-- buyers
-- -----------------------------------------------------------------------------
drop policy if exists "buyers_select" on public.buyers;
create policy "buyers_select" on public.buyers
  for select to authenticated using (farm_id = public.current_farm_id());

drop policy if exists "buyers_write" on public.buyers;
create policy "buyers_write" on public.buyers
  for insert to authenticated
  with check (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'));

drop policy if exists "buyers_update" on public.buyers;
create policy "buyers_update" on public.buyers
  for update to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'))
  with check (farm_id = public.current_farm_id());

drop policy if exists "buyers_delete" on public.buyers;
create policy "buyers_delete" on public.buyers
  for delete to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() = 'owner');

-- -----------------------------------------------------------------------------
-- sales
-- -----------------------------------------------------------------------------
drop policy if exists "sales_select" on public.sales;
create policy "sales_select" on public.sales
  for select to authenticated using (farm_id = public.current_farm_id());

drop policy if exists "sales_write" on public.sales;
create policy "sales_write" on public.sales
  for insert to authenticated
  with check (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'));

drop policy if exists "sales_update" on public.sales;
create policy "sales_update" on public.sales
  for update to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'))
  with check (farm_id = public.current_farm_id());

drop policy if exists "sales_delete" on public.sales;
create policy "sales_delete" on public.sales
  for delete to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() = 'owner');

-- -----------------------------------------------------------------------------
-- expenses
-- -----------------------------------------------------------------------------
drop policy if exists "expenses_select" on public.expenses;
create policy "expenses_select" on public.expenses
  for select to authenticated using (farm_id = public.current_farm_id());

drop policy if exists "expenses_write" on public.expenses;
create policy "expenses_write" on public.expenses
  for insert to authenticated
  with check (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'));

drop policy if exists "expenses_update" on public.expenses;
create policy "expenses_update" on public.expenses
  for update to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'))
  with check (farm_id = public.current_farm_id());

drop policy if exists "expenses_delete" on public.expenses;
create policy "expenses_delete" on public.expenses
  for delete to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() = 'owner');

-- -----------------------------------------------------------------------------
-- notifications — each user only sees their own (or farm-wide broadcasts
-- where user_id is null); anyone farm-scoped can be the writer (the app
-- server-side/background job role, or an owner/supervisor action).
-- -----------------------------------------------------------------------------
drop policy if exists "notifications_select" on public.notifications;
create policy "notifications_select" on public.notifications
  for select to authenticated
  using (farm_id = public.current_farm_id() and (user_id = auth.uid() or user_id is null));

drop policy if exists "notifications_insert" on public.notifications;
create policy "notifications_insert" on public.notifications
  for insert to authenticated
  with check (farm_id = public.current_farm_id());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update to authenticated
  using (farm_id = public.current_farm_id() and user_id = auth.uid())
  with check (farm_id = public.current_farm_id());

-- -----------------------------------------------------------------------------
-- settings — owner only
-- -----------------------------------------------------------------------------
drop policy if exists "settings_select" on public.settings;
create policy "settings_select" on public.settings
  for select to authenticated using (farm_id = public.current_farm_id());

drop policy if exists "settings_update" on public.settings;
create policy "settings_update" on public.settings
  for update to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() = 'owner')
  with check (farm_id = public.current_farm_id());

-- -----------------------------------------------------------------------------
-- activity_logs — append-only audit trail: SELECT + INSERT only
-- -----------------------------------------------------------------------------
drop policy if exists "activity_logs_select" on public.activity_logs;
create policy "activity_logs_select" on public.activity_logs
  for select to authenticated
  using (farm_id = public.current_farm_id() and public.current_role() in ('owner', 'supervisor'));

drop policy if exists "activity_logs_insert" on public.activity_logs;
create policy "activity_logs_insert" on public.activity_logs
  for insert to authenticated
  with check (farm_id = public.current_farm_id() and user_id = auth.uid());
