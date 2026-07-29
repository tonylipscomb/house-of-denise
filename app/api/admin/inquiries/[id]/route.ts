import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { getAdminInquiry, updateInquiryStatus } from "@/lib/admin/inquiries";
import { isInquiryDbStatus } from "@/lib/admin/inquiry-status";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminApi("inquiries:view");
  if (auth.error) return auth.error;

  const { id } = await params;
  const inquiry = await getAdminInquiry(id);
  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
  }

  return NextResponse.json({ inquiry });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminApi("inquiries:update");
  if (auth.error || !auth.context) return auth.error;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    status?: string;
  } | null;

  if (!body?.status || !isInquiryDbStatus(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  try {
    const inquiry = await updateInquiryStatus({
      inquiryId: id,
      status: body.status,
      actorUserId: auth.context.userId
    });
    return NextResponse.json({ inquiry });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed." },
      { status: 400 }
    );
  }
}
