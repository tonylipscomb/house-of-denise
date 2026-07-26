import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  calculateSubtotalCents,
  createCheckoutReference,
  parseCheckoutPayload,
  resolveCheckoutLines,
} from "@/lib/commerce/checkout";
import {
  attachSquareCheckout,
  createPendingOrder,
  markCheckoutError,
} from "@/lib/commerce/orders";
import { getSquareClient } from "@/lib/square/client";
import { getSquareConfig } from "@/lib/square/config";

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
    const config = getSquareConfig();

    const localOrder = await createPendingOrder({
      reference,
      payload,
      lines,
      subtotalCents,
    });
    localOrderId = localOrder.id;

    const square = getSquareClient();
    const response = await square.checkout.paymentLinks.create({
      idempotencyKey: randomUUID(),
      description: `House of Denise order ${reference}`,
      order: {
        locationId: config.locationId,
        referenceId: reference,
        lineItems: lines.map((line) => ({
          name: line.item.name,
          quantity: String(line.quantity),
          note:
            Object.keys(line.selectedOptions).length > 0
              ? Object.entries(line.selectedOptions)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(", ")
              : undefined,
          basePriceMoney: {
            amount: BigInt(line.item.priceInCents),
            currency: "USD",
          },
        })),
      },
      checkoutOptions: {
        redirectUrl: `${config.siteUrl}/checkout/success?reference=${encodeURIComponent(reference)}`,
        askForShippingAddress: lines.some(
          (line) => line.item.fulfillmentType === "shipping",
        ),
      },
      prePopulatedData: {
        buyerEmail: payload.customerEmail,
        buyerPhoneNumber: payload.customerPhone,
      },
      paymentNote: `House of Denise ${reference}`,
    });

    const paymentLink = response.paymentLink;
    const checkoutUrl = paymentLink?.longUrl ?? paymentLink?.url;
    if (!paymentLink?.id || !checkoutUrl) {
      throw new Error("Square did not return a usable checkout link.");
    }

    await attachSquareCheckout({
      orderId: localOrder.id,
      paymentLinkId: paymentLink.id,
      paymentLinkUrl: checkoutUrl,
      squareOrderId: paymentLink.orderId ?? null,
    });

    return NextResponse.json({
      checkoutUrl,
      reference,
    });
  } catch (error) {
    if (localOrderId) {
      await markCheckoutError(localOrderId).catch(() => undefined);
    }

    const message = safeErrorMessage(error);
    console.error("Square checkout creation failed", {
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
