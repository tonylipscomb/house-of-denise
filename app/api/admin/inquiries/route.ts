import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { listAdminInquiries } from "@/lib/admin/inquiries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdminApi("inquiries:view");
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const result = await listAdminInquiries({
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    page: Number(url.searchParams.get("page") ?? "1") || 1
  });

  return NextResponse.json(result);
}
