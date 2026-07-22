# LaunchPoint Booking Platform Phase 1

## Tenant Model

LaunchPoint uses `workspaces` as the tenant boundary. House Of Denise is seeded as the first workspace with slug `house-of-denise` and a stable workspace id used by the current site. Tenant-owned records include services, variants, staff profiles, bookings, notes, settings, and future inquiry ownership columns.

## Authentication Flow

Supabase Auth powers email/password registration, login, logout, password reset, and email callback exchange. Public registrations are assigned `customer` membership in the House Of Denise workspace by trusted server actions, never by browser-provided role data.

## Role Model

Roles are `customer`, `staff`, `admin`, and `owner`. Phase 1 allows customers into `/account/*` and allows only active `admin` or `owner` memberships into `/admin/*`. Staff can be expanded later without changing the tenant boundary.

## RLS Strategy

Every new table has RLS enabled. Policies use `current_user_has_workspace_role(workspace_id, roles)` to keep tenant checks centralized. Public reads are limited to active services and active service variants. Admin operations still recheck authorization in server components and server actions. The service-role admin client is server-only and must not be imported by client components.

Tenant consistency is enforced with workspace foreign keys, unique workspace constraints, check constraints, and trigger validation for cross-table relationships where a plain foreign key is not enough.

## Account Routes

`/account`, `/account/profile`, and `/account/bookings` require an authenticated Supabase session. The profile route updates only profile-safe fields: full name, phone, and marketing consent. Email changes are intentionally not handled in Phase 1.

## Admin Routes

`/admin`, `/admin/services`, `/admin/services/new`, `/admin/services/[id]`, `/admin/bookings`, `/admin/customers`, and `/admin/settings` are protected by server-side admin role checks. The sidebar labels future sections without linking to routes that are not implemented yet.

## Service Configuration

Admins can create, edit, deactivate, reorder, and add/edit variants for services. Services are soft-disabled with `active = false`; hard deletion is intentionally avoided because bookings may reference service records later.

## Migration Order

Apply the existing `booking_inquiries` migration first, then `20260722170000_launchpoint_booking_engine_phase_1.sql`. The Phase 1 migration adds nullable inquiry ownership columns and backfills existing inquiries to the House Of Denise workspace.

## Environment

Required placeholders are documented in `.env.example`:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- booking notification email variables

Secrets must remain in local or hosted environment settings only.

## First Owner Account

Create the owner through Supabase Auth, then insert or update their `profiles` row and `workspace_memberships` row with `role = 'owner'`, `status = 'active'`, and the House Of Denise workspace id. Do this from Supabase SQL editor or a trusted LaunchPoint admin script using service-role credentials.

## Adding Another Workspace

Create a new `workspaces` row, a matching `workspace_settings` row, and memberships for that client's owner/admin users. New services, variants, bookings, staff, notes, and settings must always carry the new workspace id.

## Platform Administration Later

A platform-super-admin interface can be added as a separate trust boundary with its own explicit table or claims strategy. It should not bypass workspace RLS in customer-facing or workspace-admin routes; elevated platform tasks should use audited service-role operations on server-only routes.
