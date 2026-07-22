import { NextResponse } from "next/server";
import type { BookingSubmissionResponse } from "@/data/booking";
import { submitBookingInquiry } from "@/lib/booking-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const maxRequestBytes = 20_000;

async function readJsonBody(request: Request) {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxRequestBytes) {
    return { ok: false as const, tooLarge: true as const };
  }

  try {
    return { ok: true as const, body: JSON.parse(text) as unknown };
  } catch {
    return { ok: false as const, tooLarge: false as const };
  }
}

export async function POST(request: Request) {
  const parsed = await readJsonBody(request);

  if (!parsed.ok) {
    const response: BookingSubmissionResponse = {
      success: false,
      code: parsed.tooLarge ? "abuse_rejected" : "validation_error",
      errors: {},
      message: parsed.tooLarge
        ? "We could not submit your inquiry right now. Please try again."
        : "We could not read your inquiry. Please check the form and try again."
    };
    return NextResponse.json(response, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const result = await submitBookingInquiry(parsed.body, { customerId: data.user?.id ?? null });
  return NextResponse.json(result.response, { status: result.status });
}
