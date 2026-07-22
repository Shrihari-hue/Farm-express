-- =============================================================================
-- Farm Express — Functions & Triggers (Step 4)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- current_farm_id() / current_role()
-- -----------------------------------------------------------------------------
-- Read the requesting user's farm/role once, from `public.users`, for reuse
-- across every RLS policy in policies.sql. SECURITY DEFINER + a fixed
-- search_path avoids the classic "RLS policy queries a table that itself has
-- RLS enabled" recursion trap (the function runs as its owner, bypassing the
-- caller's RLS on `public.users`, then the *caller's* RLS on every other
-- table still applies normally using the value it returns).
-- -----------------------------------------------------------------------------
create or replace function public.current_farm_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select farm_id from public.users where id = auth.uid();
$$;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

-- -----------------------------------------------------------------------------
-- set_updated_at() — generic trigger to keep `updated_at` honest
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_workers_updated_at on public.workers;
create trigger trg_workers_updated_at
  before update on public.workers
  for each row execute function public.set_updated_at();

drop trigger if exists trg_stock_updated_at on public.stock;
create trigger trg_stock_updated_at
  before update on public.stock
  for each row execute function public.set_updated_at();

drop trigger if exists trg_settings_updated_at on public.settings;
create trigger trg_settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- handle_new_user() — runs the instant someone verifies their first OTP /
-- completes Google sign-in. Creates a bare profile row (role defaults to
-- 'owner', farm_id NULL) — `complete_owner_profile` below fills in the farm.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'fullName', ''),
    new.email,
    new.phone
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- complete_owner_profile(...) — called once, right after a brand-new user's
-- first sign-in (see app/(auth)/complete-profile.tsx). Creates the farm and
-- links the caller's own profile row to it. SECURITY DEFINER because the
-- caller doesn't have (and shouldn't need) a direct INSERT policy on
-- `farms` — this RPC is the only sanctioned way a farm gets created.
-- -----------------------------------------------------------------------------
create or replace function public.complete_owner_profile(p_full_name text, p_farm_name text)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  v_farm_id uuid;
  v_result public.users;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if length(trim(p_full_name)) = 0 or length(trim(p_farm_name)) = 0 then
    raise exception 'Full name and farm name are required';
  end if;

  insert into public.farms (name, owner_id)
  values (trim(p_farm_name), auth.uid())
  returning id into v_farm_id;

  insert into public.settings (farm_id) values (v_farm_id)
  on conflict (farm_id) do nothing;

  update public.users
  set full_name = trim(p_full_name),
      farm_id = v_farm_id,
      role = 'owner'
  where id = auth.uid()
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function public.complete_owner_profile(text, text) to authenticated;
