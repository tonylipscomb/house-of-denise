create extension if not exists pgcrypto;

create table if not exists public.commerce_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  item_type text not null check (
    item_type in ('product', 'experience', 'workshop', 'deposit')
  ),
  price_cents integer not null check (price_cents >= 0),
  active boolean not null default true,
  image_url text not null default '',
  fulfillment_type text not null check (
    fulfillment_type in ('shipping', 'pickup', 'booking', 'digital')
  ),
  square_catalog_variation_id text null,
  max_per_order integer not null default 10 check (
    max_per_order between 1 and 100
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create index if not exists commerce_items_active_idx
  on public.commerce_items(active)
  where deleted_at is null;

create index if not exists commerce_items_type_idx
  on public.commerce_items(item_type)
  where deleted_at is null;

alter table public.commerce_items enable row level security;

revoke all on public.commerce_items from anon, authenticated;

insert into public.commerce_items (
  slug,
  name,
  description,
  item_type,
  price_cents,
  active,
  image_url,
  fulfillment_type,
  max_per_order,
  metadata
)
values
  (
    'mobile-fragrance-bar-deposit',
    'Mobile Fragrance Bar Deposit',
    'Starter deposit to reserve a mobile fragrance bar event date.',
    'deposit',
    12500,
    true,
    '/images/house-of-denise/shop-mobile-fragrance-bar.jpg',
    'booking',
    1,
    '{"pricing_status":"placeholder","remaining_balance":"Determined after consultation"}'::jsonb
  ),
  (
    'private-event-deposit',
    'Private Event Deposit',
    'Starter deposit to reserve a private House of Denise event.',
    'deposit',
    17500,
    true,
    '/images/house-of-denise/shop-private-events.jpg',
    'booking',
    1,
    '{"pricing_status":"placeholder","remaining_balance":"Determined after consultation"}'::jsonb
  ),
  (
    'signature-fragrance-workshop',
    'Signature Fragrance Workshop',
    'A guided fragrance-blending workshop experience.',
    'workshop',
    6500,
    true,
    '/images/house-of-denise/shop-workshops.jpg',
    'booking',
    10,
    '{"pricing_status":"placeholder","price_basis":"per guest"}'::jsonb
  ),
  (
    'perfume-bar-experience',
    'Perfume Bar Experience',
    'A hands-on perfume bar experience with guided scent selection.',
    'experience',
    8500,
    true,
    '/images/house-of-denise/shop-perfume-bar.jpg',
    'booking',
    10,
    '{"pricing_status":"placeholder","price_basis":"per guest"}'::jsonb
  ),
  (
    'custom-fragrance-gift-set',
    'Custom Fragrance Gift Set',
    'A made-up starter listing for a custom fragrance gift set.',
    'product',
    4500,
    true,
    '/images/house-of-denise/shop-custom-gift-set.jpg',
    'shipping',
    5,
    '{"pricing_status":"placeholder"}'::jsonb
  )
on conflict (slug) do nothing;

comment on table public.commerce_items is
  'Admin-managed House of Denise commerce catalog. Prices are stored in cents and resolved server-side.';
