import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  calculateSubtotalCents,
  createCheckoutReference,
  parseCheckoutPayload,
  resolveCheckoutLines,
} from "@/lib/commerce/checkout";
import {
  attachStripeCheckout,
  createPendingOrder,
  markCheckoutError,
} from "@/lib/commerce/orders";
import { getStripeClient } from "@/lib/stripe/client";
import { getStripeConfig } from "@/lib/stripe/config";

export const runtime = "nodejs";

function safeErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected checkout error.";
}

export async function POST(request: Request) {
  let localOrderId: string | undefined;

  try {
    const body = await request.json();
    const payload = parseCheckoutPayload(body);
    const lines = await resolveCheckoutLines(payload);
    const subtotalCents = calculateSubtotalCents(lines);
    const reference = createCheckoutReference();
    const config = getStripeConfig();

    const localOrder = await createPendingOrder({
      reference,
      payload,
      lines,
      subtotalCents,
    });

    localOrderId = localOrder.id;

    const stripe = getStripeClient();
    const requiresShipping = lines.some(
      (line) => line.item.fulfillmentType === "shipping",
    );

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        success_url:
          `${config.siteUrl}/checkout/success` +
          `?reference=${encodeURIComponent(reference)}` +
          "&session_id={CHECKOUT_SESSION_ID}",
        cancel_url:
          `${config.siteUrl}/checkout/cancel` +
          `?reference=${encodeURIComponent(reference)}`,
        client_reference_id: reference,
        customer_email: payload.customerEmail ?? undefined,
        phone_number_collection: {
          enabled: true,
        },
        shipping_address_collection: requiresShipping
          ? { allowed_countries: ["US"] }
          : undefined,
        line_items: lines.map((line) => ({
          quantity: line.quantity,
          price_data: {
            currency: "usd",
            unit_amount: line.item.priceInCents,
            product_data: {
              name: line.item.name,
              description:
                Object.keys(line.selectedOptions).length > 0
                  ? Object.entries(line.selectedOptions)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(", ")
                  : undefined,
              metadata: {
                commerce_item_id: line.item.id,
              },
            },
          },
        })),
        metadata: {
          payment_kind: "commerce",
          commerce_order_id: localOrder.id,
          order_reference: reference,
          expected_total_cents: String(subtotalCents),
        },
        payment_intent_data: {
          metadata: {
            payment_kind: "commerce",
            commerce_order_id: localOrder.id,
            order_reference: reference,
          },
        },
      },
      {
        idempotencyKey: randomUUID(),
      },
    );

    if (!session.id || !session.url) {
      throw new Error("Stripe did not return a usable checkout session.");
    }

    await attachStripeCheckout({
      orderId: localOrder.id,
      checkoutSessionId: session.id,
      checkoutUrl: session.url,
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      reference,
      provider: "stripe",
    });
  } catch (error) {
    if (localOrderId) {
      await markCheckoutError(localOrderId).catch(() => undefined);
    }

    const message = safeErrorMessage(error);

    console.error("Stripe checkout creation failed", {
      message,
      hasLocalOrder: Boolean(localOrderId),
    });

    const clientError =
      message.includes("payload") ||
      message.includes("item") ||
      message.includes("Quantity") ||
      message.includes("email") ||
      message.includes("phone") ||
      message.includes("Inactive") ||
      message.includes("Unknown");

    return NextResponse.json(
      {
        error: clientError
          ? message
          : "Checkout could not be started. Please try again.",
      },
      { status: clientError ? 400 : 500 },
    );
  }
}
