-- House of Denise Stripe payment tracking.
-- Safe to run more than once.

alter table public.bookings
  add column if not exists payment_provider text,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists stripe_checkout_url text;

alter table public.commerce_orders
  add column if not exists payment_provider text,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists stripe_checkout_url text;

create unique index if not exists bookings_stripe_checkout_session_id_idx
  on public.bookings (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists bookings_stripe_payment_intent_id_idx
  on public.bookings (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create unique index if not exists commerce_orders_stripe_checkout_session_id_idx
  on public.commerce_orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists commerce_orders_stripe_payment_intent_id_idx
  on public.commerce_orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;
