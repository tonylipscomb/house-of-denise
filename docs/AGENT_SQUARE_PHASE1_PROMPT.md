You are working inside:

C:\Users\tonyl\Desktop\house-of-denise

Implement Phase 1 of a reusable Square-powered commerce engine for the House of Denise Next.js 16 application.

SAFETY RULES
1. Inspect the existing project before modifying anything.
2. Preserve the existing design, booking flow, authentication, admin system, Supabase integration, and Resend integration.
3. Do not remove or rewrite working features unnecessarily.
4. Do not use Stripe.
5. Use the official `square` Node package already installed in this project.
6. Use Square Sandbox only.
7. Never expose SQUARE_ACCESS_TOKEN or private Square credentials to client components.
8. Never trust browser-supplied prices, totals, names, or deposit amounts.
9. Resolve and recalculate all prices server-side from trusted catalog data.
10. Use idempotency keys for Square checkout creation.
11. Back up every modified file.
12. Do not deploy, push, or create production charges.
13. Run validation and report exact results.

CURRENT FOUNDATION
- app/shop/page.tsx
- app/cart/page.tsx
- components/cards/ProductCard.tsx
- data/shop.ts
- data/catalog.ts
- Supabase server/browser/admin clients
- Admin routes
- Booking API and workflow
- Resend integration
- Next.js 16 App Router
- React 19
- TypeScript

A. SQUARE SERVER CLIENT
Create:
- lib/square/client.ts
- lib/square/config.ts
- lib/square/types.ts

Requirements:
- server-only modules
- sandbox/production selection, with development defaulting to sandbox
- required environment validation
- clear errors without secrets
- correct current Square SDK initialization
- reusable Square client and location ID export
- prevent client imports

Environment variables:
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_WEBHOOK_SIGNATURE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000

Do not require NEXT_PUBLIC_SQUARE_APPLICATION_ID because this phase uses hosted checkout.

B. TRUSTED COMMERCE CATALOG
Review data/shop.ts and data/catalog.ts.
Create a normalized trusted item type supporting:
- id
- slug
- name
- description
- itemType: product | experience | workshop | deposit
- priceInCents
- active
- image
- fulfillmentType: shipping | pickup | booking | digital
- optional Square catalog variation ID
- optional deposit metadata
- optional inventory metadata

Create server-side item resolution and total calculation helpers. Never accept browser prices.

C. CART FOUNDATION
Preserve the current cart design.
Support item ID, quantity, selected options, add/remove/update/clear, subtotal display, local persistence, hydration safety, and max quantity validation. The server must independently recalculate totals.

D. SQUARE CHECKOUT ROUTE
Create app/api/checkout/square/route.ts.
POST input may contain only item IDs, quantities, selected non-price options, customer email/phone, and fulfillment details.
The route must validate, resolve trusted items, reject invalid or inactive items, recalculate cents, create an internal reference and idempotency key, create a Square payment link with order line items and location ID, redirect to /checkout/success?reference={internalReference}, return only checkoutUrl and reference, and never leak secrets or raw internal errors.

E. SUPABASE ORDER PREPARATION
Add a migration for commerce_orders and commerce_order_items.
Use UUIDs, unique reference, customer fields, status/payment/fulfillment fields, currency, subtotal/total cents, Square IDs/URL, fulfillment JSONB, metadata JSONB, timestamps, paid_at, item snapshots, quantities, line totals, selected options, and foreign keys.
Enable RLS. Public users cannot list or modify orders. Use the trusted server/admin client. Existing LaunchPoint permissions control admin viewing. Create the pending order before Square redirect and preserve diagnostic state on failure.

F. RESULT PAGES
Create app/checkout/success/page.tsx and app/checkout/cancel/page.tsx.
Match House of Denise branding. Success must say confirmation may take a moment and must not claim payment is complete solely from redirect. Show only the safe reference. Cancel must explain no completed payment was confirmed and link back to cart.

G. DOCUMENTATION
Update .env.example with placeholders only.
Create docs/SQUARE_COMMERCE_SETUP.md covering Square app creation, sandbox credentials, location ID, local and Netlify variables, testing, production cutover, secret handling, and Phase 2 webhook work.

H. TESTS
Add tests for trusted item resolution, subtotal calculation, invalid/inactive items, quantity validation, malformed payloads, and environment validation where practical. Never call the real Square API during tests.

VALIDATION
Run:
npm run typecheck
npm run lint
npm run test:booking
npm run test:platform
npm run build
Run all new commerce tests too.

FINAL REPORT
List exact files created/modified, migration, required environment variables, tests, validation results, remaining Square Dashboard setup, and remaining Phase 2 work.

Do not implement production credentials, refunds, embedded card forms, live fulfillment, or webhook reconciliation yet.
