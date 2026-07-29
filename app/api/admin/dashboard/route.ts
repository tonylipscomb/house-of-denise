import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { getDashboardOverview } from "@/lib/admin/dashboard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdminApi("dashboard:view");
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const days = Number(url.searchParams.get("days") ?? "30");
  const overview = await getDashboardOverview(
    Number.isFinite(days) ? Math.min(Math.max(days, 7), 90) : 30
  );

  return NextResponse.json({ overview });
}
