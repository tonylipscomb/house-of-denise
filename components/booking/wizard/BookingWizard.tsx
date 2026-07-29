"use client";

import { useEffect, useState } from "react";
import { BookingHero, BookingProgress } from "./BookingHero";
import { BookingWizardProvider, useBookingWizard } from "./BookingWizardProvider";
import { ExperienceSelector } from "./ExperienceSelector";
import { EventDetailsStep } from "./EventDetailsStep";
import { PackageSelector } from "./PackageSelector";
import { ScheduleStep } from "./ScheduleStep";
import { ReviewStep } from "./ReviewStep";
import { BookingSummary, BookingSummaryDrawer, PaymentStep } from "./BookingSummary";
import { BeforeYouBegin } from "./BeforeYouBegin";

function WizardBody() {
  const { state, hydrated } = useBookingWizard();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const heading = document.getElementById(`bw-step-${state.currentStep}-focus`);
    heading?.focus();
  }, [state.currentStep]);

  if (!hydrated) {
    return <div className="bw-loading">Preparing your booking experience…</div>;
  }

  return (
    <>
      <BookingHero />
      <BookingProgress />

      <div className="bw-layout">
        <div className="bw-main">
          <div id={`bw-step-${state.currentStep}-focus`} tabIndex={-1} className="bw-step-focus">
            {state.currentStep === 0 ? <ExperienceSelector /> : null}
            {state.currentStep === 1 ? <EventDetailsStep /> : null}
            {state.currentStep === 2 ? <PackageSelector /> : null}
            {state.currentStep === 3 ? <ScheduleStep /> : null}
            {state.currentStep === 4 ? <ReviewStep /> : null}
            {state.currentStep === 5 ? <PaymentStep /> : null}
          </div>
        </div>

        <div className="bw-sidebar desktop-only">
          {state.currentStep === 0 ? <BeforeYouBegin /> : <BookingSummary />}
        </div>
      </div>

      {state.currentStep === 0 ? (
        <div className="bw-before-mobile">
          <BeforeYouBegin />
        </div>
      ) : null}

      <div className="bw-mobile-summary">
        <BookingSummary compact onOpenDrawer={() => setDrawerOpen(true)} />
      </div>
      <BookingSummaryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

export function BookingWizard({
  initialCustomer
}: {
  initialCustomer?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
}) {
  return (
    <BookingWizardProvider initialCustomer={initialCustomer}>
      <div className="bw-page">
        <div className="lux-container">
          <WizardBody />
        </div>
      </div>
    </BookingWizardProvider>
  );
}
