create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  legal_name text,
  status text not null default 'active',
  timezone text not null default 'America/New_York',
  email text,
  phone text,
  website_url text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspaces_status_check check (status in ('active', 'inactive', 'suspended')),
  constraint workspaces_slug_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_memberships_role_check check (role in ('customer', 'staff', 'admin', 'owner')),
  constraint workspace_memberships_status_check check (status in ('invited', 'active', 'disabled')),
  constraint workspace_memberships_unique_user unique (workspace_id, user_id)
);

create table if not exists public.workspace_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  booking_enabled boolean not null default false,
  default_timezone text not null default 'America/New_York',
  currency text not null default 'USD',
  minimum_notice_hours integer,
  maximum_advance_days integer,
  default_slot_interval_minutes integer,
  maximum_bookings_per_day integer,
  guest_checkout_enabled boolean not null default false,
  customer_accounts_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_settings_non_negative check (
    coalesce(minimum_notice_hours, 0) >= 0 and
    coalesce(maximum_advance_days, 0) >= 0 and
    coalesce(default_slot_interval_minutes, 0) >= 0 and
    coalesce(maximum_bookings_per_day, 0) >= 0
  )
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  slug text not null,
  name text not null,
  short_description text,
  description text,
  category text,
  booking_mode text not null default 'inquiry',
  active boolean not null default true,
  featured boolean not null default false,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_booking_mode_check check (booking_mode in ('inquiry', 'direct')),
  constraint services_sort_order_check check (sort_order >= 0),
  constraint services_workspace_slug_unique unique (workspace_id, slug)
);

create table if not exists public.service_variants (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  name text not null,
  active boolean not null default true,
  duration_minutes integer,
  setup_minutes integer,
  cleanup_minutes integer,
  travel_buffer_minutes integer,
  minimum_guest_count integer,
  maximum_guest_count integer,
  minimum_notice_hours integer,
  maximum_advance_days integer,
  price_amount integer,
  deposit_amount integer,
  deposit_percentage numeric,
  currency text not null default 'USD',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_variants_non_negative check (
    coalesce(duration_minutes, 0) >= 0 and coalesce(setup_minutes, 0) >= 0 and
    coalesce(cleanup_minutes, 0) >= 0 and coalesce(travel_buffer_minutes, 0) >= 0 and
    coalesce(minimum_guest_count, 0) >= 0 and coalesce(maximum_guest_count, 0) >= 0 and
    coalesce(minimum_notice_hours, 0) >= 0 and coalesce(maximum_advance_days, 0) >= 0 and
    coalesce(price_amount, 0) >= 0 and coalesce(deposit_amount, 0) >= 0 and
    coalesce(deposit_percentage, 0) >= 0 and coalesce(deposit_percentage, 0) <= 100 and
    sort_order >= 0
  ),
  constraint service_variants_guest_range check (
    minimum_guest_count is null or maximum_guest_count is null or minimum_guest_count <= maximum_guest_count
  )
);

create table if not exists public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  display_name text,
  bio text,
  active boolean not null default true,
  timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_profiles_unique_user unique (workspace_id, user_id)
);

create table if not exists public.staff_services (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  staff_profile_id uuid not null references public.staff_profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  service_variant_id uuid references public.service_variants(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  reference_number text not null unique,
  customer_id uuid references public.profiles(id) on delete set null,
  guest_email text,
  guest_name text,
  guest_phone text,
  service_id uuid references public.services(id) on delete restrict,
  service_variant_id uuid references public.service_variants(id) on delete restrict,
  staff_profile_id uuid references public.staff_profiles(id) on delete set null,
  start_at timestamptz,
  end_at timestamptz,
  timezone text,
  guest_count integer,
  status text not null default 'draft',
  payment_status text not null default 'unpaid',
  source text not null default 'admin',
  customer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_status_check check (status in ('draft','pending','pending_payment','confirmed','cancelled','rescheduled','completed','no_show')),
  constraint bookings_payment_status_check check (payment_status in ('not_required','unpaid','pending','paid','partially_refunded','refunded','failed')),
  constraint bookings_source_check check (source in ('website','admin','import','inquiry_conversion')),
  constraint bookings_guest_count_check check (guest_count is null or guest_count > 0),
  constraint bookings_time_check check (start_at is null or end_at is null or end_at > start_at)
);

create table if not exists public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  booking_inquiry_id uuid references public.booking_inquiries(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_notes_target_check check (booking_id is not null or booking_inquiry_id is not null)
);

alter table public.booking_inquiries add column if not exists workspace_id uuid references public.workspaces(id) on delete set null;
alter table public.booking_inquiries add column if not exists customer_id uuid references public.profiles(id) on delete set null;
alter table public.booking_inquiries add column if not exists assigned_user_id uuid references public.profiles(id) on delete set null;
alter table public.booking_inquiries add column if not exists converted_booking_id uuid references public.bookings(id) on delete set null;

insert into public.workspaces (id, slug, name, legal_name, status, timezone, email, website_url)
values ('7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'house-of-denise', 'House Of Denise', 'House Of Denise', 'active', 'America/New_York', 'info@houseofdenise.com', 'https://houseofdenise.com')
on conflict (id) do update set name = excluded.name, slug = excluded.slug, updated_at = now();

insert into public.workspace_settings (workspace_id, booking_enabled, default_timezone, currency, customer_accounts_enabled)
values ('7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', false, 'America/New_York', 'USD', true)
on conflict (workspace_id) do nothing;

insert into public.services (workspace_id, slug, name, category, booking_mode, active, featured, sort_order)
values
('7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'mobile-fragrance-bar', 'Mobile Fragrance Bar', 'Fragrance', 'inquiry', true, true, 10),
('7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'luxury-workshops', 'Luxury Workshops', 'Workshops', 'direct', false, false, 20),
('7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'private-events', 'Private Events', 'Events', 'inquiry', true, false, 30),
('7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'gift-experiences', 'Gift Experiences', 'Gifts', 'inquiry', true, false, 40)
on conflict (workspace_id, slug) do nothing;

update public.booking_inquiries
set workspace_id = '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861'
where workspace_id is null;

create index if not exists workspace_memberships_workspace_user_idx on public.workspace_memberships (workspace_id, user_id, status);
create index if not exists workspace_memberships_role_idx on public.workspace_memberships (workspace_id, role, status);
create index if not exists services_workspace_active_idx on public.services (workspace_id, active, sort_order);
create index if not exists service_variants_workspace_service_idx on public.service_variants (workspace_id, service_id, active);
create index if not exists bookings_workspace_customer_idx on public.bookings (workspace_id, customer_id);
create index if not exists bookings_workspace_start_idx on public.bookings (workspace_id, start_at);
create index if not exists bookings_workspace_staff_idx on public.bookings (workspace_id, staff_profile_id);
create index if not exists bookings_workspace_status_idx on public.bookings (workspace_id, status);
create index if not exists booking_inquiries_workspace_idx on public.booking_inquiries (workspace_id, created_at desc);

create or replace function public.current_user_has_workspace_role(target_workspace_id uuid, allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_memberships wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wm.role = any(allowed_roles)
  );
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create or replace function public.prevent_self_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = new.user_id and old.role is distinct from new.role then
    raise exception 'Users cannot change their own role';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_self_role_escalation_trigger on public.workspace_memberships;
create trigger prevent_self_role_escalation_trigger
before update of role on public.workspace_memberships
for each row execute function public.prevent_self_role_escalation();

create or replace function public.assert_staff_services_workspace()
returns trigger
language plpgsql
as $$
begin
  if not exists (select 1 from public.staff_profiles sp where sp.id = new.staff_profile_id and sp.workspace_id = new.workspace_id) then
    raise exception 'staff profile workspace mismatch';
  end if;
  if not exists (select 1 from public.services s where s.id = new.service_id and s.workspace_id = new.workspace_id) then
    raise exception 'service workspace mismatch';
  end if;
  if new.service_variant_id is not null and not exists (select 1 from public.service_variants sv where sv.id = new.service_variant_id and sv.workspace_id = new.workspace_id and sv.service_id = new.service_id) then
    raise exception 'service variant workspace mismatch';
  end if;
  return new;
end;
$$;

drop trigger if exists assert_staff_services_workspace_trigger on public.staff_services;
create trigger assert_staff_services_workspace_trigger
before insert or update on public.staff_services
for each row execute function public.assert_staff_services_workspace();

do $$
declare table_name text;
begin
  foreach table_name in array array['workspaces','profiles','workspace_memberships','workspace_settings','services','service_variants','staff_profiles','staff_services','bookings','booking_status_history','admin_notes'] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

drop policy if exists "Members can read active workspaces" on public.workspaces;
create policy "Members can read active workspaces" on public.workspaces
for select to authenticated using (status = 'active' and public.current_user_has_workspace_role(id, array['customer','staff','admin','owner']));
drop policy if exists "Admins can update workspaces" on public.workspaces;
create policy "Admins can update workspaces" on public.workspaces
for update to authenticated using (public.current_user_has_workspace_role(id, array['admin','owner'])) with check (public.current_user_has_workspace_role(id, array['admin','owner']));

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "Admins can read workspace profiles" on public.profiles;
create policy "Admins can read workspace profiles" on public.profiles for select to authenticated using (
  exists (
    select 1 from public.workspace_memberships wm
    where wm.user_id = profiles.id
      and public.current_user_has_workspace_role(wm.workspace_id, array['admin','owner'])
  )
);

drop policy if exists "Users can read own memberships" on public.workspace_memberships;
create policy "Users can read own memberships" on public.workspace_memberships for select to authenticated using (user_id = auth.uid());
drop policy if exists "Owners manage memberships" on public.workspace_memberships;
create policy "Owners manage memberships" on public.workspace_memberships for all to authenticated
using (public.current_user_has_workspace_role(workspace_id, array['owner']))
with check (public.current_user_has_workspace_role(workspace_id, array['owner']));

drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services" on public.services for select to anon, authenticated using (active is true);
drop policy if exists "Admins manage services" on public.services;
create policy "Admins manage services" on public.services for all to authenticated
using (public.current_user_has_workspace_role(workspace_id, array['admin','owner']))
with check (public.current_user_has_workspace_role(workspace_id, array['admin','owner']));

drop policy if exists "Public can read active service variants" on public.service_variants;
create policy "Public can read active service variants" on public.service_variants for select to anon, authenticated using (
  active is true and exists (select 1 from public.services s where s.id = service_id and s.active is true)
);
drop policy if exists "Admins manage service variants" on public.service_variants;
create policy "Admins manage service variants" on public.service_variants for all to authenticated
using (public.current_user_has_workspace_role(workspace_id, array['admin','owner']))
with check (public.current_user_has_workspace_role(workspace_id, array['admin','owner']));

drop policy if exists "Admins manage workspace settings" on public.workspace_settings;
create policy "Admins manage workspace settings" on public.workspace_settings for all to authenticated
using (public.current_user_has_workspace_role(workspace_id, array['admin','owner']))
with check (public.current_user_has_workspace_role(workspace_id, array['admin','owner']));

drop policy if exists "Staff read staff profiles" on public.staff_profiles;
create policy "Staff read staff profiles" on public.staff_profiles for select to authenticated using (user_id = auth.uid() or public.current_user_has_workspace_role(workspace_id, array['admin','owner']));
drop policy if exists "Admins manage staff profiles" on public.staff_profiles;
create policy "Admins manage staff profiles" on public.staff_profiles for all to authenticated using (public.current_user_has_workspace_role(workspace_id, array['admin','owner'])) with check (public.current_user_has_workspace_role(workspace_id, array['admin','owner']));

drop policy if exists "Admins manage staff services" on public.staff_services;
create policy "Admins manage staff services" on public.staff_services for all to authenticated using (public.current_user_has_workspace_role(workspace_id, array['admin','owner'])) with check (public.current_user_has_workspace_role(workspace_id, array['admin','owner']));

drop policy if exists "Customers read own bookings" on public.bookings;
create policy "Customers read own bookings" on public.bookings for select to authenticated using (customer_id = auth.uid() or public.current_user_has_workspace_role(workspace_id, array['admin','owner']));
drop policy if exists "Admins manage bookings" on public.bookings;
create policy "Admins manage bookings" on public.bookings for all to authenticated using (public.current_user_has_workspace_role(workspace_id, array['admin','owner'])) with check (public.current_user_has_workspace_role(workspace_id, array['admin','owner']));

drop policy if exists "Admins read booking status history" on public.booking_status_history;
create policy "Admins read booking status history" on public.booking_status_history for select to authenticated using (public.current_user_has_workspace_role(workspace_id, array['admin','owner']));
drop policy if exists "Admins manage admin notes" on public.admin_notes;
create policy "Admins manage admin notes" on public.admin_notes for all to authenticated using (public.current_user_has_workspace_role(workspace_id, array['staff','admin','owner'])) with check (public.current_user_has_workspace_role(workspace_id, array['staff','admin','owner']));

drop trigger if exists set_workspaces_updated_at on public.workspaces;
create trigger set_workspaces_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists set_workspace_memberships_updated_at on public.workspace_memberships;
create trigger set_workspace_memberships_updated_at before update on public.workspace_memberships for each row execute function public.set_updated_at();
drop trigger if exists set_workspace_settings_updated_at on public.workspace_settings;
create trigger set_workspace_settings_updated_at before update on public.workspace_settings for each row execute function public.set_updated_at();
drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at before update on public.services for each row execute function public.set_updated_at();
drop trigger if exists set_service_variants_updated_at on public.service_variants;
create trigger set_service_variants_updated_at before update on public.service_variants for each row execute function public.set_updated_at();
drop trigger if exists set_staff_profiles_updated_at on public.staff_profiles;
create trigger set_staff_profiles_updated_at before update on public.staff_profiles for each row execute function public.set_updated_at();
drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at before update on public.bookings for each row execute function public.set_updated_at();
drop trigger if exists set_admin_notes_updated_at on public.admin_notes;
create trigger set_admin_notes_updated_at before update on public.admin_notes for each row execute function public.set_updated_at();
