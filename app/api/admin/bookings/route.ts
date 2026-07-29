import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { listAdminBookings } from "@/lib/admin/bookings";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdminApi("bookings:view");
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const result = await listAdminBookings({
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    paymentStatus: url.searchParams.get("paymentStatus") ?? undefined,
    experience: url.searchParams.get("experience") ?? undefined,
    tab: (url.searchParams.get("tab") as "all" | "upcoming" | "past") || "all",
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    page: Number(url.searchParams.get("page") ?? "1") || 1
  });

  return NextResponse.json(result);
}
