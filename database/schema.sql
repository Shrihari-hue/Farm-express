-- =============================================================================
-- Farm Express — Database Schema (Step 4)
-- =============================================================================
-- Target: Supabase Postgres. Run via `supabase db push` (see
-- database/migrations/0001_init.sql, which is the actual applied migration —
-- this file plus functions.sql and policies.sql are the organized, reviewable
-- source that migration mirrors).
--
-- Design notes:
--   * Multi-tenant by `farm_id` on every farm-scoped table. Row Level
--     Security (policies.sql) enforces the tenant boundary — the app never
--     has to remember to add `WHERE farm_id = ...` for security purposes,
--     only for query correctness.
--   * `public.users` is a 1:1 profile row keyed by `auth.users.id`
--     (Supabase's own auth table), created automatically by a trigger
--     (see functions.sql#handle_new_user) the moment someone verifies their
--     first OTP. It starts with `farm_id = NULL`; the `complete_owner_profile`
--     RPC fills that in once the user names their farm (see app's Step 3
--     "complete profile" screen).
--   * `workers.user_id` is an optional link to `public.users` — set only
--     when a permanent worker is invited to log in as "labour" (Step 13's
--     team-invite flow). Until then, worker records exist purely as data
--     entered by the owner/supervisor with no login of their own.
--   * "salary" as a concept spans three things rather than one table:
--     `workers.monthly_salary` (the fixed figure the owner sets once),
--     `salary_advances` (running ledger), and `salary_payments` (the
--     computed, generated slip for a period). Keeping them separate avoids
--     redundant/denormalized copies of the same number.
-- =============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- =============================================================================
-- roles — reference table (kept normalized/extensible rather than a bare
-- Postgres enum, so labels can change without a migration).
-- =============================================================================
create table if not exists public.roles (
  id text primary key,
  label text not null
);

insert into public.roles (id, label) values
  ('owner', 'Farm Owner'),
  ('supervisor', 'Farm Supervisor'),
  ('labour', 'Labour')
on conflict (id) do nothing;

-- =============================================================================
-- farms
-- =============================================================================
create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  location text,
  phone text,
  currency text not null default 'INR',
  language text not null default 'en',
  created_at timestamptz not null default now()
);

create index if not exists idx_farms_owner on public.farms (owner_id);

-- =============================================================================
-- users — 1:1 profile for every authenticated person (owner/supervisor/labour)
-- =============================================================================
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  farm_id uuid references public.farms (id) on delete set null,
  full_name text not null default '',
  role text not null default 'owner' references public.roles (id),
  email text,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_farm on public.users (farm_id);

-- =============================================================================
-- workers — permanent + casual labour
-- =============================================================================
create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,
  type text not null check (type in ('permanent', 'casual')),
  name text not null,
  photo_url text,
  phone text,
  address text,
  village text,
  joining_date date,
  monthly_salary numeric(12, 2) check (monthly_salary is null or monthly_salary >= 0),
  daily_wage numeric(12, 2) check (daily_wage is null or daily_wage >= 0),
  bank_details jsonb,
  status text not null default 'active' check (status in ('active', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workers_farm on public.workers (farm_id);
create index if not exists idx_workers_type on public.workers (farm_id, type);
create index if not exists idx_workers_status on public.workers (farm_id, status);
create unique index if not exists idx_workers_user on public.workers (user_id) where user_id is not null;

-- =============================================================================
-- attendance — one row per worker per day
-- =============================================================================
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  worker_id uuid not null references public.workers (id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent', 'half_day', 'leave', 'late')),
  todays_wage numeric(12, 2) check (todays_wage is null or todays_wage >= 0),
  work_done text,
  remarks text,
  marked_by uuid not null references public.users (id),
  created_at timestamptz not null default now(),
  unique (worker_id, date)
);

create index if not exists idx_attendance_farm_date on public.attendance (farm_id, date);
create index if not exists idx_attendance_worker on public.attendance (worker_id, date);

-- =============================================================================
-- salary_advances — running ledger per worker
-- =============================================================================
create table if not exists public.salary_advances (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  worker_id uuid not null references public.workers (id) on delete cascade,
  date date not null default current_date,
  amount numeric(12, 2) not null check (amount > 0),
  reason text,
  remaining_balance numeric(12, 2) not null check (remaining_balance >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_advances_worker on public.salary_advances (worker_id, date);
create index if not exists idx_advances_farm on public.salary_advances (farm_id);

-- =============================================================================
-- salary_payments — generated monthly slip (permanent) / period rollup (casual)
-- =============================================================================
create table if not exists public.salary_payments (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  worker_id uuid not null references public.workers (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  working_days numeric(5, 1) not null default 0,
  leaves numeric(5, 1) not null default 0,
  half_days numeric(5, 1) not null default 0,
  advance_deducted numeric(12, 2) not null default 0 check (advance_deducted >= 0),
  bonuses numeric(12, 2) not null default 0 check (bonuses >= 0),
  deductions numeric(12, 2) not null default 0 check (deductions >= 0),
  gross_amount numeric(12, 2) not null check (gross_amount >= 0),
  net_amount numeric(12, 2) not null check (net_amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  check (period_end >= period_start),
  unique (worker_id, period_start, period_end)
);

create index if not exists idx_salary_payments_farm_period on public.salary_payments (farm_id, period_start);
create index if not exists idx_salary_payments_status on public.salary_payments (farm_id, status);

-- =============================================================================
-- stock — current inventory (one row per item)
-- =============================================================================
create table if not exists public.stock (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  category text not null check (
    category in ('coconut_bags', 'arecanut_bags', 'pepper', 'banana', 'coffee', 'mango', 'custom')
  ),
  name text not null,
  unit text not null,
  quantity numeric(12, 2) not null default 0 check (quantity >= 0),
  location text,
  low_stock_threshold numeric(12, 2) check (low_stock_threshold is null or low_stock_threshold >= 0),
  added_by uuid not null references public.users (id),
  updated_by uuid not null references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_stock_farm on public.stock (farm_id);
create unique index if not exists idx_stock_farm_name on public.stock (farm_id, name);

-- =============================================================================
-- stock_history — append-only daily ledger. Never updated or deleted by the
-- app (see policies.sql — no UPDATE/DELETE policy exists for this table).
-- =============================================================================
create table if not exists public.stock_history (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  stock_item_id uuid not null references public.stock (id) on delete cascade,
  date date not null default current_date,
  opening_quantity numeric(12, 2) not null default 0,
  harvested_today numeric(12, 2) not null default 0 check (harvested_today >= 0),
  sold_today numeric(12, 2) not null default 0 check (sold_today >= 0),
  damaged numeric(12, 2) not null default 0 check (damaged >= 0),
  remaining_stock numeric(12, 2) not null default 0 check (remaining_stock >= 0),
  notes text,
  recorded_by uuid not null references public.users (id),
  created_at timestamptz not null default now(),
  unique (stock_item_id, date)
);

create index if not exists idx_stock_history_item_date on public.stock_history (stock_item_id, date);
create index if not exists idx_stock_history_farm_date on public.stock_history (farm_id, date);

-- =============================================================================
-- buyers
-- =============================================================================
create table if not exists public.buyers (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  name text not null,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_buyers_farm on public.buyers (farm_id);

-- =============================================================================
-- sales
-- =============================================================================
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  stock_item_id uuid not null references public.stock (id),
  buyer_id uuid not null references public.buyers (id),
  quantity numeric(12, 2) not null check (quantity > 0),
  rate numeric(12, 2) not null check (rate >= 0),
  amount numeric(12, 2) not null check (amount >= 0),
  transport_cost numeric(12, 2) not null default 0 check (transport_cost >= 0),
  commission numeric(12, 2) not null default 0 check (commission >= 0),
  net_amount numeric(12, 2) not null check (net_amount >= 0),
  payment_method text not null check (payment_method in ('cash', 'upi', 'bank', 'credit')),
  date date not null default current_date,
  remarks text,
  recorded_by uuid not null references public.users (id),
  created_at timestamptz not null default now()
);

create index if not exists idx_sales_farm_date on public.sales (farm_id, date);
create index if not exists idx_sales_buyer on public.sales (buyer_id);

-- =============================================================================
-- expenses
-- =============================================================================
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  category text not null check (
    category in (
      'fertilizer', 'fuel', 'pesticides', 'seeds', 'electricity',
      'water', 'maintenance', 'machine_repair', 'transport', 'miscellaneous'
    )
  ),
  amount numeric(12, 2) not null check (amount > 0),
  date date not null default current_date,
  bill_image_url text,
  notes text,
  recorded_by uuid not null references public.users (id),
  created_at timestamptz not null default now()
);

create index if not exists idx_expenses_farm_date on public.expenses (farm_id, date);
create index if not exists idx_expenses_category on public.expenses (farm_id, category);

-- =============================================================================
-- notifications
-- =============================================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  user_id uuid references public.users (id) on delete cascade,
  title text not null,
  body text not null,
  type text not null check (
    type in ('attendance', 'stock', 'salary', 'payment', 'low_stock', 'general')
  ),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications (user_id, is_read);
create index if not exists idx_notifications_farm on public.notifications (farm_id, created_at desc);

-- =============================================================================
-- settings — one row per farm
-- =============================================================================
create table if not exists public.settings (
  farm_id uuid primary key references public.farms (id) on delete cascade,
  notifications_enabled boolean not null default true,
  low_stock_alerts_enabled boolean not null default true,
  attendance_reminder_time time not null default '19:00',
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- activity_logs — audit trail, append-only (see policies.sql)
-- =============================================================================
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  user_id uuid not null references public.users (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_logs_farm on public.activity_logs (farm_id, created_at desc);
create index if not exists idx_activity_logs_entity on public.activity_logs (entity_type, entity_id);
