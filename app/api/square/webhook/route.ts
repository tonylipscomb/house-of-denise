import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error: "Square payments are disabled. House of Denise now uses Stripe.",
    },
    { status: 410 },
  );
}
