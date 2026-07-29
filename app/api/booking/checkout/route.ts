import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createBookingSquareCheckout } from "@/lib/booking-wizard/checkout";
import type { BookingWizardState } from "@/lib/booking-wizard/types";
import { canNavigateToStep } from "@/lib/booking-wizard/types";

export const runtime = "nodejs";

function isWizardState(value: unknown): value is BookingWizardState {
  return Boolean(value && typeof value === "object" && (value as BookingWizardState).version === 1);
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
        customerId = user?.id ?? null;
      }
    } catch {
      customerId = null;
    }

    const result = await createBookingSquareCheckout({
      state,
      customerId,
      idempotencyKey
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected checkout error.";
    console.error("Booking checkout failed", { message });

    const clientError =
      message.includes("required") ||
      message.includes("available") ||
      message.includes("Custom packages") ||
      message.includes("Invalid") ||
      message.includes("consultation") ||
      message.includes("reserved");

    return NextResponse.json(
      {
        error: clientError
          ? message
          : "Checkout could not be started. Please try again in a moment."
      },
      { status: clientError ? 400 : 500 }
    );
  }
}
