-- Admin dashboard Phase 1
-- Non-destructive expansion of inquiry workflow statuses.
-- Existing rows keep their legacy values (new, reviewing, followed-up, closed).

alter table public.booking_inquiries
  drop constraint if exists booking_inquiries_status_check;

alter table public.booking_inquiries
  add constraint booking_inquiries_status_check
  check (
    inquiry_status in (
      'new',
      'reviewing',
      'followed-up',
      'closed',
      'contacted',
      'consultation_scheduled',
      'proposal_sent',
      'converted'
    )
  );

comment on constraint booking_inquiries_status_check on public.booking_inquiries is
  'Legacy inquiry statuses preserved; expanded workflow values added for LaunchPoint admin Phase 1.';
