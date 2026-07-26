# House of Denise Square Commerce Setup

## Phase 1 status

Phase 1 creates trusted server-side catalog resolution, pending Supabase
orders, Square-hosted payment links, result pages, a database migration,
and focused tests.

Webhook verification is intentionally not part of Phase 1. A browser
redirect must never be treated as proof that an order was paid.

## Square Sandbox

1. Sign in to the Square Developer Console.
2. Create or open the House of Denise application.
3. Use the Sandbox credentials page.
4. Copy the Sandbox application ID and Sandbox access token.
5. Open the Sandbox test account and copy its location ID.
6. Keep all private credentials outside Git.

## Local `.env.local`

```env
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_WEBHOOK_SIGNATURE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

The Square access token, webhook key, and Supabase service-role key are
server secrets. Never prefix them with `NEXT_PUBLIC_`.

## Database

Apply the new migration in `supabase/migrations` to the correct Supabase
project before testing checkout.

## Netlify

Create the same variables under the site's environment variable settings.
Use Sandbox values until the full checkout and webhook flow passes testing.

## Testing

```powershell
npm run typecheck
npm run lint
npm run test:booking
npm run test:platform
npm run test:commerce
npm run build
```

## Production cutover

Do not switch to production until:

- Square webhooks are implemented and signature verified.
- Paid orders are reconciled server-side.
- The final House of Denise catalog and pricing are approved.
- Refund and cancellation handling is documented.
- Sandbox checkout has been tested end-to-end.
- Production Square and Netlify credentials are entered securely.
