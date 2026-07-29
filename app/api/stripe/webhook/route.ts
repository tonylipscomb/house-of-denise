import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { syncBookingFromStripeSession } from "@/lib/booking-wizard/payment-sync";
import { getStripeClient } from "@/lib/stripe/client";
import { getStripeConfig } from "@/lib/stripe/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function syncCommerceOrder(session: Stripe.Checkout.Session) {
  const admin = getSupabaseAdminClient();
  const orderId = session.metadata?.commerce_order_id?.trim();

  if (!admin || !orderId) return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  await admin
    .from("commerce_orders")
    .update({
      payment_provider: "stripe",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      payment_status:
        session.payment_status === "paid" ? "paid" : "pending",
      status:
        session.payment_status === "paid"
          ? "paid"
          : "checkout_created",
      paid_at:
        session.payment_status === "paid"
          ? new Date().toISOString()
          : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
}

export async function POST(request: Request) {
  const config = getStripeConfig();

  if (!config.webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook verification is not configured." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const body = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      config.webhookSecret,
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed", {
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 },
    );
  }

  try {
    if (
      [
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
        "checkout.session.async_payment_failed",
        "checkout.session.expired",
      ].includes(event.type)
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const kind = session.metadata?.payment_kind;

      if (kind === "booking") {
        await syncBookingFromStripeSession(session);
      }

      if (kind === "commerce") {
        await syncCommerceOrder(session);
      }
    }
  } catch (error) {
    console.error("Stripe webhook processing failed", {
      eventType: event.type,
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
