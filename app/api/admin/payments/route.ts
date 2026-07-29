import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { listAdminPayments } from "@/lib/admin/payments";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdminApi("payments:view");
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const result = await listAdminPayments({
    q: url.searchParams.get("q") ?? undefined,
    page: Number(url.searchParams.get("page") ?? "1") || 1
  });

  return NextResponse.json(result);
}
