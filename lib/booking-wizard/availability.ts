import { BOOKING_TIMEZONE } from "@/data/booking-catalog";

export type AvailabilitySlot = {
  id: string;
  label: string;
  startHour: number;
  startMinute: number;
};

export type DayAvailability = {
  date: string; // YYYY-MM-DD
  available: boolean;
  slots: AvailabilitySlot[];
};

const WEEKDAY_SLOTS: AvailabilitySlot[] = [
  { id: "1000", label: "10:00 AM", startHour: 10, startMinute: 0 },
  { id: "1300", label: "1:00 PM", startHour: 13, startMinute: 0 },
  { id: "1400", label: "2:00 PM", startHour: 14, startMinute: 0 },
  { id: "1600", label: "4:00 PM", startHour: 16, startMinute: 0 },
  { id: "1800", label: "6:00 PM", startHour: 18, startMinute: 0 }
];

const WEEKEND_SLOTS: AvailabilitySlot[] = [
  { id: "1100", label: "11:00 AM", startHour: 11, startMinute: 0 },
  { id: "1300", label: "1:00 PM", startHour: 13, startMinute: 0 },
  { id: "1500", label: "3:00 PM", startHour: 15, startMinute: 0 },
  { id: "1700", label: "5:00 PM", startHour: 17, startMinute: 0 }
];

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Typed availability adapter.
 * Replace internals with Supabase availability queries without changing callers.
 */
export async function getMonthAvailability(options: {
  year: number;
  monthIndex: number; // 0-11
  blockedDates?: string[];
}): Promise<DayAvailability[]> {
  const { year, monthIndex, blockedDates = [] } = options;
  const blocked = new Set(blockedDates);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const result: DayAvailability[] = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    const iso = toIsoDate(date);
    const isPast = date < today;
    const dow = date.getDay();
    const isSunday = dow === 0;
    const available = !isPast && !isSunday && !blocked.has(iso);
    const slots = available ? (dow === 6 ? WEEKEND_SLOTS : WEEKDAY_SLOTS) : [];
    result.push({ date: iso, available, slots });
  }

  return result;
}

export async function getSlotsForDate(dateIso: string): Promise<AvailabilitySlot[]> {
  const month = parseIsoDate(dateIso);
  const days = await getMonthAvailability({
    year: month.getFullYear(),
    monthIndex: month.getMonth()
  });
  return days.find((day) => day.date === dateIso)?.slots ?? [];
}

export function buildStartEndIso(options: {
  dateIso: string;
  slot: AvailabilitySlot;
  durationMinutes: number;
  timezone?: string;
}): { startAt: string; endAt: string; timezone: string } {
  const timezone = options.timezone ?? BOOKING_TIMEZONE;
  const start = new Date(
    `${options.dateIso}T${String(options.slot.startHour).padStart(2, "0")}:${String(options.slot.startMinute).padStart(2, "0")}:00`
  );
  const end = new Date(start.getTime() + options.durationMinutes * 60_000);
  return {
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    timezone
  };
}

export { BOOKING_TIMEZONE };
