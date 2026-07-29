import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  listCalendarEvents,
  parseCalendarAnchor,
  type CalendarView
} from "@/lib/admin/calendar";
import { formatDateTime, safeSearchParam } from "@/lib/admin/dashboard-utils";
import { createPageMetadata } from "@/lib/metadata";
import {
  blockCalendarDateAction,
  deleteCalendarBlockAction
} from "../phase2-actions";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Admin Calendar",
  description: "House of Denise booking calendar.",
  path: "/admin/calendar"
});

function shiftAnchor(anchor: Date, view: CalendarView, delta: number) {
  const next = new Date(anchor);
  if (view === "week") next.setDate(next.getDate() + delta * 7);
  else next.setMonth(next.getMonth() + delta);
  return next.toISOString().slice(0, 10);
}

function buildMonthCells(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const cells: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    cells.push(day);
  }
  return cells;
}

export default async function AdminCalendarPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const view = (safeSearchParam(params.view, "month") || "month") as CalendarView;
  const anchor = parseCalendarAnchor(safeSearchParam(params.anchor));
  const anchorIso = anchor.toISOString().slice(0, 10);
  const events = await listCalendarEvents({ view, anchor });

  const monthLabel = anchor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  const cells = view === "month" ? buildMonthCells(anchor) : [];
  const weekStart = new Date(anchor);
  weekStart.setDate(anchor.getDate() - anchor.getDay());
  const weekDays =
    view === "week"
      ? Array.from({ length: 7 }, (_, index) => {
          const day = new Date(weekStart);
          day.setDate(weekStart.getDate() + index);
          return day;
        })
      : [];

  const eventsByDay = new Map<string, typeof events>();
  for (const event of events) {
    const key = event.startAt.slice(0, 10);
    const list = eventsByDay.get(key) ?? [];
    list.push(event);
    eventsByDay.set(key, list);
  }

  const blockEvents = events.filter((event) => event.kind === "block");

  return (
    <>
      <header className="lp-page-header">
        <div>
          <p className="lp-admin__topbar-eyebrow">Scheduling</p>
          <h1>Calendar</h1>
          <p>
            Confirmed bookings, consultations from inquiries, and blocked dates.
            Blocking a date prevents wizard checkout on that day.
          </p>
        </div>
      </header>

      <div className="lp-tabs">
        {(["month", "week", "agenda"] as const).map((value) => (
          <Link
            key={value}
            href={`/admin/calendar?view=${value}&anchor=${anchorIso}`}
            className={view === value ? "is-active" : undefined}
          >
            {value[0].toUpperCase() + value.slice(1)}
          </Link>
        ))}
      </div>

      <div className="lp-filter-bar" style={{ justifyContent: "space-between" }}>
        <div className="lp-tabs">
          <Link
            href={`/admin/calendar?view=${view}&anchor=${shiftAnchor(anchor, view, -1)}`}
            className="lp-btn"
          >
            Previous
          </Link>
          <Link
            href={`/admin/calendar?view=${view}&anchor=${new Date().toISOString().slice(0, 10)}`}
            className="lp-btn"
          >
            Today
          </Link>
          <Link
            href={`/admin/calendar?view=${view}&anchor=${shiftAnchor(anchor, view, 1)}`}
            className="lp-btn"
          >
            Next
          </Link>
        </div>
        <strong>{monthLabel}</strong>
      </div>

      <div className="lp-detail-grid">
        <section className="lp-panel">
          {view === "agenda" ? (
            !events.length ? (
              <p className="lp-empty">No events in this range.</p>
            ) : (
              <ul className="lp-activity">
                {events.map((event) => (
                  <li key={event.id}>
                    <div className="lp-activity__main">
                      {event.href ? (
                        <Link href={event.href} className="lp-activity__title">
                          {event.title}
                        </Link>
                      ) : (
                        <span className="lp-activity__title">{event.title}</span>
                      )}
                      <span className="lp-activity__subtitle">{event.subtitle}</span>
                    </div>
                    <div className="lp-activity__meta">
                      <StatusBadge label={event.status} tone={event.tone as never} />
                      <span>{formatDateTime(event.startAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className={`lp-cal lp-cal--${view}`}>
              <div className="lp-cal__head">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="lp-cal__grid">
                {(view === "month" ? cells : weekDays).map((day) => {
                  const key = day.toISOString().slice(0, 10);
                  const dayEvents = eventsByDay.get(key) ?? [];
                  const inMonth = day.getMonth() === anchor.getMonth();
                  return (
                    <div
                      key={key}
                      className={`lp-cal__day${inMonth || view === "week" ? "" : " is-muted"}`}
                    >
                      <div className="lp-cal__day-num">{day.getDate()}</div>
                      <ul>
                        {dayEvents.slice(0, view === "week" ? 8 : 3).map((event) => (
                          <li key={event.id} className={`lp-cal__event lp-cal__event--${event.kind}`}>
                            {event.href ? (
                              <Link href={event.href}>{event.title}</Link>
                            ) : (
                              <span>{event.title}</span>
                            )}
                          </li>
                        ))}
                        {dayEvents.length > (view === "week" ? 8 : 3) ? (
                          <li className="lp-cal__more">
                            +{dayEvents.length - (view === "week" ? 8 : 3)} more
                          </li>
                        ) : null}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <div className="lp-stack">
          <section className="lp-panel">
            <header className="lp-panel__header">
              <h2>Block a date</h2>
            </header>
            <form action={blockCalendarDateAction} className="lp-form">
              <label>
                Date
                <input type="date" name="blockDate" required defaultValue={anchorIso} />
              </label>
              <label>
                Title
                <input name="title" defaultValue="Unavailable" />
              </label>
              <label>
                Internal note
                <textarea name="notes" rows={3} placeholder="Reason for blocking" />
              </label>
              <button type="submit" className="lp-btn lp-btn--primary">
                Block date
              </button>
            </form>
          </section>

          <section className="lp-panel">
            <header className="lp-panel__header">
              <h2>Blocked dates</h2>
            </header>
            {!blockEvents.length ? (
              <p className="lp-empty">No blocks in this range.</p>
            ) : (
              <ul className="lp-activity">
                {blockEvents.map((event) => (
                  <li key={event.id}>
                    <div className="lp-activity__main">
                      <span className="lp-activity__title">{event.title}</span>
                      <span className="lp-activity__subtitle">
                        {formatDateTime(event.startAt)} · {event.subtitle}
                      </span>
                    </div>
                    <form action={deleteCalendarBlockAction}>
                      <input type="hidden" name="id" value={event.id.replace("block-", "")} />
                      <input type="hidden" name="anchor" value={anchorIso} />
                      <button type="submit" className="lp-btn">
                        Remove
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
