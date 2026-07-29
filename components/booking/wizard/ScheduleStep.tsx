"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  BOOKING_TIMEZONE,
  getMonthAvailability,
  type AvailabilitySlot,
  type DayAvailability
} from "@/lib/booking-wizard/availability";
import { Button } from "@/components/ui/Button";
import { useBookingWizard } from "./BookingWizardProvider";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function ScheduleStep() {
  const { state, dispatch, nextStep, prevStep } = useBookingWizard();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), monthIndex: now.getMonth() };
  });
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getMonthAvailability(cursor)
      .then((result) => {
        if (cancelled) return;
        startTransition(() => {
          setDays(result);
          setError(null);
        });
      })
      .catch(() => {
        if (cancelled) return;
        startTransition(() => {
          setError("Availability could not be loaded. Please try again.");
        });
      });
    return () => {
      cancelled = true;
    };
  }, [cursor]);

  const selectedDay = days.find((day) => day.date === state.schedule.date);
  const monthLabel = useMemo(
    () =>
      new Date(cursor.year, cursor.monthIndex, 1).toLocaleString("en-US", {
        month: "long",
        year: "numeric"
      }),
    [cursor]
  );

  function selectSlot(slot: AvailabilitySlot) {
    dispatch({
      type: "SET_SCHEDULE",
      schedule: {
        timeSlotId: slot.id,
        timeLabel: slot.label,
        timezone: BOOKING_TIMEZONE
      }
    });
  }

  return (
    <section className="bw-panel" aria-labelledby="schedule-title">
      <header className="bw-panel__header">
        <p className="lux-eyebrow">STEP 4</p>
        <h2 id="schedule-title">Select Date & Time</h2>
        <p>Times shown in Eastern Time ({BOOKING_TIMEZONE.replace("_", " ")}).</p>
      </header>

      <div className="bw-schedule">
        <div className="bw-calendar">
          <div className="bw-calendar__nav">
            <button
              type="button"
              className="lux-header__icon"
              aria-label="Previous month"
              onClick={() =>
                setCursor((prev) => {
                  const date = new Date(prev.year, prev.monthIndex - 1, 1);
                  return { year: date.getFullYear(), monthIndex: date.getMonth() };
                })
              }
            >
              <ChevronLeft size={18} />
            </button>
            <p>{monthLabel}</p>
            <button
              type="button"
              className="lux-header__icon"
              aria-label="Next month"
              onClick={() =>
                setCursor((prev) => {
                  const date = new Date(prev.year, prev.monthIndex + 1, 1);
                  return { year: date.getFullYear(), monthIndex: date.getMonth() };
                })
              }
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="bw-calendar__weekdays" aria-hidden="true">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {isPending && days.length === 0 ? (
            <p className="bw-muted">Loading availability…</p>
          ) : error ? (
            <p className="bw-error">{error}</p>
          ) : (
            <div className="bw-calendar__grid" role="grid" aria-label="Availability calendar">
              {Array.from({ length: new Date(cursor.year, cursor.monthIndex, 1).getDay() }).map(
                (_, index) => (
                  <span key={`pad-${index}`} />
                )
              )}
              {days.map((day) => {
                const dayNumber = Number(day.date.split("-")[2]);
                return (
                  <button
                    key={day.date}
                    type="button"
                    disabled={!day.available}
                    className={cn(
                      "bw-calendar__day",
                      day.available && "is-available",
                      state.schedule.date === day.date && "is-selected"
                    )}
                    onClick={() =>
                      dispatch({
                        type: "SET_SCHEDULE",
                        schedule: {
                          date: day.date,
                          timeSlotId: null,
                          timeLabel: null
                        }
                      })
                    }
                  >
                    {dayNumber}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bw-slots">
          <h3>Available Times</h3>
          {!state.schedule.date ? (
            <p className="bw-muted">Select a date to view time slots.</p>
          ) : !selectedDay?.slots.length ? (
            <p className="bw-muted">No times available for this date.</p>
          ) : (
            <div className="bw-slots__grid">
              {selectedDay.slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  className={cn(
                    "bw-slot",
                    state.schedule.timeSlotId === slot.id && "is-selected"
                  )}
                  onClick={() => selectSlot(slot)}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bw-step-actions">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button
          variant="primary"
          disabled={!state.schedule.date || !state.schedule.timeSlotId}
          onClick={() => nextStep()}
        >
          Continue to Review
        </Button>
      </div>
    </section>
  );
}
