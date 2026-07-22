# House Of Denise — LaunchPoint Starter

A responsive Next.js starter for House Of Denise: ecommerce, workshops, perfume-bar appointments, and private-event booking.

## Start locally

```powershell
cd house-of-denise-starter
npm install
npm run dev
```

Open `http://localhost:3000`.

## Booking inquiry setup

The `/booking` flow stores accepted inquiries in Supabase before attempting Resend emails. There is no in-memory production fallback.

1. Create or select the Supabase project for House Of Denise.
2. Run `supabase/migrations/20260722131000_create_booking_inquiries.sql` against that project.
3. Add local environment variables in `.env.local` using `.env.example` as the placeholder source.
4. Verify the Resend sending domain that will be used by `BOOKING_FROM_EMAIL`.
5. Add the same Supabase and Resend variables to Netlify.
6. Test one inquiry from `/booking`.
7. Confirm the row exists in `booking_inquiries`.
8. Confirm the owner notification and customer confirmation emails were delivered.
9. Never commit `.env.local` or any real secret values.

Required booking variables:

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
BOOKING_NOTIFICATION_EMAIL=info@houseofdenise.com
BOOKING_FROM_EMAIL=
BOOKING_REPLY_TO_EMAIL=info@houseofdenise.com
```

`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and booking email values are server-only. Do not prefix them with `NEXT_PUBLIC_`. Future admin access to `booking_inquiries` should use authenticated server-side authorization; customers should not receive direct table access.

## Included now

- Responsive premium homepage
- Shop/catalog starter
- Experiences and event cards
- Booking inquiry flow with Supabase storage and Resend notification hooks
- Founder/About Tasheika page
- Shared header/footer and reusable cards
- House Of Denise design tokens and responsive styling
- Existing mockups and Shopify screen recording in `public/reference`

## Next build phase

1. Replace sample products, events, prices, policies, and copy after Tasheika returns the questionnaire.
2. Add Supabase schema for products, variants, inventory, customers, orders, events, sessions, and attendees.
3. Connect Stripe Checkout, taxes, shipping rates, deposits, refunds, and webhooks.
4. Add authenticated customer accounts and Tasheika's admin dashboard.
5. Add calendar attachments after confirmation rules are finalized.
6. Migrate domain, product images, customer/order data, and SEO redirects from Shopify.

## Important

The booking form is intentionally non-transactional. A submitted inquiry does not reserve a date, confirm availability, or collect payment. Do not collect live payments until Stripe or Square webhooks, inventory/capacity locking, refund rules, and confirmation handling are implemented and tested.
