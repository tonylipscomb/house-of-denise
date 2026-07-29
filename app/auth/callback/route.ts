import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureHouseOfDeniseCustomer } from "@/lib/launchpoint/auth";
import { claimBookingsForVerifiedEmail } from "@/lib/booking-wizard/claim-bookings";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();

  if (code && supabase) {
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    if (data.user) {
      await ensureHouseOfDeniseCustomer(
        data.user.id,
        data.user.email ?? null,
        data.user.user_metadata?.full_name
      );
      await claimBookingsForVerifiedEmail({
        userId: data.user.id,
        email: data.user.email
      });
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
