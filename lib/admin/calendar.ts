import "server-only";

import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { bookingStatusLabel, bookingStatusTone } from "./booking-status";
import { humanizeSlug } from "./dashboard-utils";

export type CalendarView = "month" | "week" | "agenda";

export type CalendarEvent = {
  id: string;
  kind: "booking" | "inquiry" | "block";
  title: string;
  subtitle: string;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  status: string;
  tone: string;
  href?: string;
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfWeek(date: Date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function parseCalendarAnchor(value?: string) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T12:00:00`);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}

export async function listCalendarEvents(params: {
  view: CalendarView;
  anchor: Date;
}): Promise<CalendarEvent[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];

  const rangeStart =
    params.view === "week" ? startOfWeek(params.anchor) : startOfMonth(params.anchor);
  const rangeEnd =
    params.view === "week" ? endOfWeek(params.anchor) : endOfMonth(params.anchor);

  // Expand month grid to full weeks
  if (params.view === "month") {
    rangeStart.setTime(startOfWeek(rangeStart).getTime());
    rangeEnd.setTime(endOfWeek(rangeEnd).getTime());
  }

  const fromIso = rangeStart.toISOString();
  const toIso = rangeEnd.toISOString();
  const fromDate = rangeStart.toISOString().slice(0, 10);
  const toDate = rangeEnd.toISOString().slice(0, 10);

  const [bookingsResult, inquiriesResult, blocksResult] = await Promise.all([
    admin
      .from("bookings")
      .select(
        "id, reference_number, guest_name, experience_slug, start_at, end_at, status, payment_status"
      )
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .not("start_at", "is", null)
      .lte("start_at", toIso)
      .gte("start_at", fromIso)
      .order("start_at", { ascending: true }),
    admin
      .from("booking_inquiries")
      .select(
        "id, reference_number, full_name, event_type, event_date, event_start_time, inquiry_status, converted_booking_id"
      )
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .gte("event_date", fromDate)
      .lte("event_date", toDate)
      .order("event_date", { ascending: true }),
    admin
      .from("calendar_blocks")
      .select("*")
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
  ]);

  const events: CalendarEvent[] = [];

  for (const booking of bookingsResult.data ?? []) {
    if (!booking.start_at) continue;
    events.push({
      id: `booking-${booking.id}`,
      kind: "booking",
      title: booking.reference_number,
      subtitle: `${booking.guest_name ?? "Guest"} · ${humanizeSlug(booking.experience_slug)}`,
      startAt: booking.start_at,
      endAt: booking.end_at,
      allDay: false,
      status: bookingStatusLabel(booking.status, booking.payment_status),
      tone: bookingStatusTone(booking.status),
      href: `/admin/bookings/${booking.id}`
    });
  }

  for (const inquiry of inquiriesResult.data ?? []) {
    if (inquiry.converted_booking_id) continue;
    const startAt = `${inquiry.event_date}T${inquiry.event_start_time || "12:00"}:00`;
    events.push({
      id: `inquiry-${inquiry.id}`,
      kind: "inquiry",
      title: inquiry.reference_number,
      subtitle: `${inquiry.full_name} · ${inquiry.event_type} (consultation)`,
      startAt,
      endAt: null,
      allDay: !inquiry.event_start_time,
      status: inquiry.inquiry_status,
      tone: "info",
      href: `/admin/inquiries/${inquiry.id}`
    });
  }

  for (const block of blocksResult.data ?? []) {
    const startAt = block.all_day
      ? `${block.block_date}T00:00:00`
      : block.start_at;
    const endAt = block.all_day ? `${block.block_date}T23:59:59` : block.end_at;
    if (!startAt) continue;
    if (block.all_day && block.block_date) {
      if (block.block_date < fromDate || block.block_date > toDate) continue;
    } else if (block.start_at && (block.start_at > toIso || (block.end_at && block.end_at < fromIso))) {
      continue;
    }
    events.push({
      id: `block-${block.id}`,
      kind: "block",
      title: block.title || "Blocked",
      subtitle: block.notes || "Unavailable",
      startAt,
      endAt,
      allDay: block.all_day,
      status: "blocked",
      tone: "danger"
    });
  }

  return events.sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );
}

export async function createCalendarBlock(input: {
  title: string;
  blockDate: string;
  notes?: string;
  actorUserId: string;
}) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");

  const { data, error } = await admin
    .from("calendar_blocks")
    .insert({
      workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
      title: input.title || "Blocked",
      block_date: input.blockDate,
      all_day: true,
      notes: input.notes || null,
      created_by: input.actorUserId
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCalendarBlock(id: string) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");
  const { error } = await admin
    .from("calendar_blocks")
    .delete()
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .eq("id", id);
  if (error) throw new Error(error.message);
}
