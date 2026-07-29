-- Booking wizard extensions for House of Denise
-- Adds event/pricing/payment fields and booking upgrade line items.

alter table public.bookings
  add column if not exists venue_name text,
  add column if not exists event_address text,
  add column if not exists occasion text,
  add column if not exists event_type text,
  add column if not exists indoor_outdoor text,
  add column if not exists special_requests text,
  add column if not exists accessibility_needs text,
  add column if not exists additional_notes text,
  add column if not exists preferred_contact_method text,
  add column if not exists package_slug text,
  add column if not exists package_price_cents integer not null default 0,
  add column if not exists upgrade_total_cents integer not null default 0,
  add column if not exists service_fee_cents integer not null default 0,
  add column if not exists subtotal_cents integer not null default 0,
  add column if not exists deposit_amount_cents integer not null default 0,
  add column if not exists amount_paid_cents integer not null default 0,
  add column if not exists remaining_balance_cents integer not null default 0,
  add column if not exists remaining_balance_due_at timestamptz,
  add column if not exists payment_option text not null default 'deposit',
  add column if not exists square_checkout_id text,
  add column if not exists square_payment_id text,
  add column if not exists square_payment_link_url text,
  add column if not exists checkout_idempotency_key text,
  add column if not exists experience_slug text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookings_payment_option_check'
  ) then
    alter table public.bookings
      add constraint bookings_payment_option_check
      check (payment_option in ('deposit', 'full'));
  end if;
end $$;

-- Expand booking status values used by the wizard
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings
  add constraint bookings_status_check check (
    status in (
      'draft',
      'pending',
      'pending_payment',
      'payment_pending',
      'pending_review',
      'confirmed',
      'changes_requested',
      'cancelled',
      'rescheduled',
      'completed',
      'no_show',
      'declined'
    )
  );

alter table public.bookings drop constraint if exists bookings_payment_status_check;
alter table public.bookings
  add constraint bookings_payment_status_check check (
    payment_status in (
      'not_required',
      'unpaid',
      'pending',
      'deposit_paid',
      'paid',
      'partially_refunded',
      'refunded',
      'failed'
    )
  );

create table if not exists public.booking_upgrades (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  upgrade_slug text not null,
  name text not null,
  description text not null default '',
  unit_price_cents integer,
  quantity integer not null default 1 check (quantity > 0),
  line_total_cents integer,
  quoted_separately boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists booking_upgrades_booking_idx
  on public.booking_upgrades (booking_id);

create unique index if not exists bookings_checkout_idempotency_uidx
  on public.bookings (checkout_idempotency_key)
  where checkout_idempotency_key is not null;

alter table public.booking_upgrades enable row level security;

revoke all on public.booking_upgrades from anon, authenticated;

comment on table public.booking_upgrades is
  'Selected upgrades for experience bookings created by the House of Denise wizard.';
