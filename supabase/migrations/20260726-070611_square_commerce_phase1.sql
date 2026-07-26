create extension if not exists pgcrypto;

create table if not exists public.commerce_orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_id uuid null references auth.users(id) on delete set null,
  customer_email text null,
  customer_phone text null,
  status text not null default 'pending_checkout',
  payment_status text not null default 'unpaid',
  fulfillment_status text not null default 'unfulfilled',
  currency text not null default 'USD',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  square_order_id text null,
  square_payment_link_id text null,
  square_payment_link_url text null,
  fulfillment_type text null,
  fulfillment_details jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz null
);

create table if not exists public.commerce_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete cascade,
  item_id text not null,
  item_name text not null,
  item_type text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  line_total_cents integer not null check (line_total_cents >= 0),
  selected_options jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists commerce_orders_reference_idx
  on public.commerce_orders(reference);

create index if not exists commerce_orders_customer_id_idx
  on public.commerce_orders(customer_id);

create index if not exists commerce_order_items_order_id_idx
  on public.commerce_order_items(order_id);

alter table public.commerce_orders enable row level security;
alter table public.commerce_order_items enable row level security;

revoke all on public.commerce_orders from anon, authenticated;
revoke all on public.commerce_order_items from anon, authenticated;

comment on table public.commerce_orders is
  'Server-managed House of Denise commerce orders. Phase 1 uses the service-role server client only.';

comment on table public.commerce_order_items is
  'Immutable item snapshots belonging to House of Denise commerce orders.';
