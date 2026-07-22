create extension if not exists "pgcrypto";

create table if not exists public.booking_inquiries (
  id uuid primary key default gen_random_uuid(),
  reference_number text unique not null,
  full_name text not null,
  email text not null,
  phone text not null,
  preferred_contact_method text,
  event_type text not null,
  event_date date not null,
  event_start_time text,
  venue_name text,
  event_city text not null,
  event_state text not null,
  event_zip text,
  estimated_guest_count integer not null,
  experience_format text not null,
  event_description text,
  special_requests text,
  referral_source text,
  consent_accepted boolean not null,
  inquiry_status text not null default 'new',
  deposit_status text not null default 'not_requested',
  square_checkout_reference text,
  square_payment_reference text,
  owner_email_status text not null default 'pending',
  customer_email_status text not null default 'pending',
  submission_fingerprint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_inquiries_guest_count_positive check (estimated_guest_count > 0),
  constraint booking_inquiries_consent_required check (consent_accepted is true),
  constraint booking_inquiries_status_check check (inquiry_status in ('new', 'reviewing', 'followed-up', 'closed')),
  constraint booking_inquiries_deposit_status_check check (deposit_status in ('not_requested', 'pending', 'paid', 'waived')),
  constraint booking_inquiries_owner_email_status_check check (owner_email_status in ('pending', 'sent', 'failed')),
  constraint booking_inquiries_customer_email_status_check check (customer_email_status in ('pending', 'sent', 'failed'))
);

create index if not exists booking_inquiries_created_at_idx
  on public.booking_inquiries (created_at desc);

create index if not exists booking_inquiries_submission_fingerprint_idx
  on public.booking_inquiries (submission_fingerprint, created_at desc)
  where submission_fingerprint is not null;

create or replace function public.set_booking_inquiries_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_booking_inquiries_updated_at on public.booking_inquiries;

create trigger set_booking_inquiries_updated_at
before update on public.booking_inquiries
for each row
execute function public.set_booking_inquiries_updated_at();

alter table public.booking_inquiries enable row level security;

drop policy if exists "No public booking inquiry access" on public.booking_inquiries;

create policy "No public booking inquiry access"
on public.booking_inquiries
as restrictive
for all
to anon, authenticated
using (false)
with check (false);
