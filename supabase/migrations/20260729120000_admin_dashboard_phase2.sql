-- Phase 2 admin: calendar blocks, customer notes, editable booking catalog
-- Wizard keeps snapshot pricing; catalog tables feed admin + resolved catalog loader.

create table if not exists public.calendar_blocks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null default 'Blocked',
  block_date date,
  start_at timestamptz,
  end_at timestamptz,
  all_day boolean not null default true,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_blocks_time_check check (
    (all_day = true and block_date is not null)
    or (all_day = false and start_at is not null and end_at is not null)
  )
);

create index if not exists calendar_blocks_workspace_date_idx
  on public.calendar_blocks (workspace_id, block_date);

create index if not exists calendar_blocks_workspace_start_idx
  on public.calendar_blocks (workspace_id, start_at);

create table if not exists public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  customer_email text not null,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_notes_email_idx
  on public.customer_notes (workspace_id, lower(customer_email), created_at desc);

create table if not exists public.catalog_packages (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text not null default '',
  price_cents integer,
  guest_allowance integer not null default 0,
  fragrance_options integer not null default 0,
  features jsonb not null default '[]'::jsonb,
  most_popular boolean not null default false,
  requires_manual_approval boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_upgrades (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text not null default '',
  pricing_type text not null default 'flat'
    check (pricing_type in ('flat', 'per_guest', 'per_hour', 'quote')),
  price_cents integer,
  allow_quantity boolean not null default false,
  max_quantity integer not null default 1,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_experiences (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null default '',
  image_src text,
  image_alt text,
  starting_price_cents integer not null default 0,
  duration_label text,
  guest_range_label text,
  min_guests integer not null default 1,
  max_guests integer not null default 50,
  duration_minutes integer not null default 120,
  deposit_percent integer not null default 30,
  service_fee_cents integer not null default 0,
  most_popular boolean not null default false,
  package_ids jsonb not null default '[]'::jsonb,
  upgrade_ids jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

alter table public.calendar_blocks enable row level security;
alter table public.customer_notes enable row level security;
alter table public.catalog_packages enable row level security;
alter table public.catalog_upgrades enable row level security;
alter table public.catalog_experiences enable row level security;

revoke all on public.calendar_blocks from anon, authenticated;
revoke all on public.customer_notes from anon, authenticated;
revoke all on public.catalog_packages from anon, authenticated;
revoke all on public.catalog_upgrades from anon, authenticated;
revoke all on public.catalog_experiences from anon, authenticated;

-- Seed House of Denise catalog from current static defaults (idempotent)
insert into public.catalog_packages (
  id, workspace_id, name, description, price_cents, guest_allowance, fragrance_options,
  features, most_popular, requires_manual_approval, active, sort_order
) values
  ('essential', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'Essential',
   'An elegant entry-level experience with curated fragrance options.', 85000, 25, 2,
   '["2 Fragrance Options","Base Guest Allowance","Guided Scent Experience"]'::jsonb,
   false, false, true, 10),
  ('signature', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'Signature',
   'Our most-loved package with premium presentation and broader selection.', 125000, 50, 3,
   '["3 Fragrance Options","Up to 50 Guests","Premium Presentation"]'::jsonb,
   true, false, true, 20),
  ('luxury', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'Luxury',
   'An elevated experience with expanded fragrance selection and styling.', 175000, 75, 5,
   '["5 Fragrance Options","Up to 75 Guests","Elevated Decor"]'::jsonb,
   false, false, true, 30),
  ('custom', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'Custom',
   'A fully tailored experience for larger or highly personalized events.', null, 100, 6,
   '["Custom Fragrance Direction","Flexible Guest Count","Manual Approval Required"]'::jsonb,
   false, true, true, 40)
on conflict (id) do nothing;

insert into public.catalog_upgrades (
  id, workspace_id, name, description, pricing_type, price_cents, allow_quantity, max_quantity, active, sort_order
) values
  ('additional-guests', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'Additional Guests',
   'Add guest capacity beyond the selected package allowance.', 'per_guest', 1500, true, 50, true, 10),
  ('custom-labels', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'Custom Labels',
   'Personalized fragrance labels for your celebration.', 'flat', 7500, false, 1, true, 20),
  ('gift-packaging', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'Gift Packaging',
   'Elevated packaging for take-home fragrance keepsakes.', 'flat', 9500, false, 1, true, 30),
  ('travel-outside-area', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'Travel Outside Service Area',
   'Travel fee for venues outside the standard service radius.', 'quote', null, false, 1, true, 40),
  ('extra-fragrance-station', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'Extra Fragrance Station',
   'An additional blending station for larger guest flow.', 'flat', 25000, false, 1, true, 50),
  ('extended-event-time', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'Extended Event Time',
   'Add one extra hour to the experience window.', 'per_hour', 20000, true, 3, true, 60),
  ('decor-upgrade', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'Decor Upgrade',
   'Enhanced tablescape and fragrance bar styling.', 'flat', 17500, false, 1, true, 70),
  ('luxury-takeaway-favors', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'Luxury Takeaway Favors',
   'Premium guest favors to remember the experience.', 'flat', 12500, false, 1, true, 80),
  ('custom-signage', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'Custom Signage',
   'Branded or celebration-specific signage for the experience.', 'flat', 8500, false, 1, true, 90)
on conflict (id) do nothing;

insert into public.catalog_experiences (
  id, workspace_id, slug, title, description, image_src, image_alt,
  starting_price_cents, duration_label, guest_range_label, min_guests, max_guests,
  duration_minutes, deposit_percent, service_fee_cents, most_popular,
  package_ids, upgrade_ids, active, featured, sort_order
) values
  ('mobile-fragrance-bar', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'mobile-fragrance-bar',
   'Mobile Fragrance Bar',
   'We bring the fragrance experience to you. A luxurious, hands-on scent experience your guests will love.',
   '/images/house-of-denise/mobile-fragrance-bar.png', 'Mobile fragrance bar experience',
   85000, '2–3 hours', '1–100 Guests', 1, 100, 150, 30, 12500, true,
   '["essential","signature","luxury","custom"]'::jsonb,
   '["additional-guests","custom-labels","gift-packaging","travel-outside-area","extra-fragrance-station","extended-event-time","decor-upgrade","luxury-takeaway-favors","custom-signage"]'::jsonb,
   true, true, 10),
  ('private-events', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'private-events',
   'Private Events',
   'An intimate, customized fragrance experience designed for celebrations and gatherings.',
   '/images/house-of-denise/private-events.jpg', 'Private fragrance event',
   85000, '2–4 hours', '1–100 Guests', 1, 100, 180, 30, 12500, false,
   '["essential","signature","luxury","custom"]'::jsonb,
   '["additional-guests","custom-labels","gift-packaging","travel-outside-area","extra-fragrance-station","extended-event-time","decor-upgrade","luxury-takeaway-favors","custom-signage"]'::jsonb,
   true, true, 20),
  ('luxury-workshops', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'luxury-workshops',
   'Luxury Workshops',
   'Guided workshop sessions for creative groups who want to learn and blend together.',
   '/images/house-of-denise/luxury-workshops.jpg', 'Luxury fragrance workshop',
   85000, '2 hours', '1–100 Guests', 1, 100, 120, 30, 12500, false,
   '["essential","signature","luxury","custom"]'::jsonb,
   '["additional-guests","custom-labels","gift-packaging","travel-outside-area","extended-event-time","decor-upgrade","luxury-takeaway-favors","custom-signage"]'::jsonb,
   true, false, 30),
  ('perfume-bar-experience', '7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861', 'perfume-bar-experience',
   'Perfume Bar Experience',
   'A refined perfume-bar style session for celebrations and gatherings.',
   '/images/house-of-denise/shop-perfume-bar.jpg', 'Perfume bar experience',
   85000, '2–3 hours', '1–100 Guests', 1, 100, 150, 30, 12500, false,
   '["essential","signature","luxury","custom"]'::jsonb,
   '["additional-guests","custom-labels","gift-packaging","travel-outside-area","extra-fragrance-station","extended-event-time","decor-upgrade","luxury-takeaway-favors","custom-signage"]'::jsonb,
   true, false, 40)
on conflict (id) do nothing;

comment on table public.calendar_blocks is 'Admin-blocked dates/times to prevent double-booking.';
comment on table public.customer_notes is 'Internal CRM notes keyed by customer email.';
comment on table public.catalog_packages is 'Editable booking packages for House of Denise admin + resolved catalog.';
comment on table public.catalog_upgrades is 'Editable booking upgrades for House of Denise admin + resolved catalog.';
comment on table public.catalog_experiences is 'Editable booking experiences for House of Denise admin + resolved catalog.';
