-- House of Denise: Square booking payment tracking
-- Safe to run more than once.

alter table public.bookings
  add column if not exists square_order_id text,
  add column if not exists square_payment_id text,
  add column if not exists square_receipt_url text,
  add column if not exists paid_at timestamptz;

create index if not exists bookings_square_order_id_idx
  on public.bookings (square_order_id)
  where square_order_id is not null;

create index if not exists bookings_square_payment_id_idx
  on public.bookings (square_payment_id)
  where square_payment_id is not null;

comment on column public.bookings.square_order_id is
  'Square order created by the hosted Checkout payment link.';

comment on column public.bookings.square_payment_id is
  'Most recent Square payment associated with this booking.';

comment on column public.bookings.square_receipt_url is
  'Square-hosted receipt URL for the latest completed payment.';

comment on column public.bookings.paid_at is
  'Timestamp when the latest completed Square payment was recorded.';
