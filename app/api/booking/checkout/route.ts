import { NextResponse } from "next/server";
import { createBookingStripeCheckout } from "@/lib/booking-wizard/checkout";
import type { BookingWizardState } from "@/lib/booking-wizard/types";
import { canNavigateToStep } from "@/lib/booking-wizard/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseConfigError } from "@/lib/supabase/env";

export const runtime = "nodejs";

function isWizardState(value: unknown): value is BookingWizardState {
  return Boolean(value && typeof value === "object" && (value as BookingWizardState).version === 1);
}

function stripeFailureMessage(message: string) {
  return (
    message.includes("Stripe") ||
    message.includes("stripe") ||
    message.includes("checkout session")
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const state = body?.state;
    const idempotencyKey =
      typeof body?.idempotencyKey === "string" && body.idempotencyKey.trim()
        ? body.idempotencyKey.trim()
        : null;

    if (!isWizardState(state) || !idempotencyKey) {
      return NextResponse.json(
        { error: "Booking checkout payload is invalid." },
        { status: 400 }
      );
    }

    if (!canNavigateToStep(state, 5) || !state.termsAccepted) {
      return NextResponse.json(
        { error: "Please complete all required booking steps before checkout." },
        { status: 400 }
      );
    }

    let customerId: string | null = null;
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const {
          data: { user }
        } = await supabase.auth.getUser();
        const { resolveBookingCustomerId } = await import(
          "@/lib/booking-wizard/claim-bookings"
        );
        customerId = resolveBookingCustomerId({
          authUserId: user?.id,
          authEmail: user?.email,
          guestEmail: state.customer.email
        });
      }
    } catch {
      customerId = null;
    }

    const result = await createBookingStripeCheckout({
      state,
      customerId,
      idempotencyKey
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected checkout error.";
    console.error("Booking checkout failed", {
      message,
      code: error instanceof SupabaseConfigError ? error.code : undefined
    });

    if (error instanceof SupabaseConfigError) {
      const status =
        error.code === "database_error"
          ? 500
          : error.code === "supabase_auth_failure" ||
              error.code === "project_key_mismatch" ||
              error.code === "invalid_service_role_key"
            ? 502
            : 500;

      return NextResponse.json(
        {
          error: error.message,
          code: error.code
        },
        { status }
      );
    }

    if (stripeFailureMessage(message)) {
      return NextResponse.json(
        {
          error: "Stripe Checkout could not be started. Please try again in a moment.",
          code: "stripe_checkout_failure"
        },
        { status: 502 }
      );
    }

    const clientError =
      message.includes("required") ||
      message.includes("available") ||
      message.includes("Custom packages") ||
      message.includes("Invalid booking") ||
      message.includes("consultation") ||
      message.includes("reserved") ||
      message.includes("unavailable");

    return NextResponse.json(
      {
        error: clientError
          ? message
          : "Checkout could not be started. Please try again in a moment.",
        code: clientError ? "booking_validation_error" : "checkout_failure"
      },
      { status: clientError ? 400 : 500 }
    );
  }
}
