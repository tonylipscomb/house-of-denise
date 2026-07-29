"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState
} from "react";
import { calculateBookingPricing, type PricingBreakdown } from "@/lib/booking-wizard/pricing";
import {
  BOOKING_WIZARD_STORAGE_KEY,
  bookingWizardReducer,
  canNavigateToStep,
  createEmptyWizardState,
  type BookingWizardAction,
  type BookingWizardState,
  type BookingWizardStepIndex
} from "@/lib/booking-wizard/types";

type BookingWizardContextValue = {
  state: BookingWizardState;
  dispatch: React.Dispatch<BookingWizardAction>;
  pricing: PricingBreakdown | null;
  pricingError: string | null;
  hydrated: boolean;
  goToStep: (step: BookingWizardStepIndex) => boolean;
  nextStep: () => boolean;
  prevStep: () => void;
  clearDraft: () => void;
};

const BookingWizardContext = createContext<BookingWizardContextValue | null>(null);

function readDraft(): BookingWizardState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(BOOKING_WIZARD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BookingWizardState;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

function createInitialState(
  initialCustomer?: Partial<BookingWizardState["customer"]>
): BookingWizardState {
  const empty = createEmptyWizardState();
  if (!initialCustomer) return empty;
  return {
    ...empty,
    customer: { ...empty.customer, ...initialCustomer }
  };
}

export function BookingWizardProvider({
  children,
  initialCustomer
}: {
  children: React.ReactNode;
  initialCustomer?: Partial<BookingWizardState["customer"]>;
}) {
  const [state, dispatch] = useReducer(
    bookingWizardReducer,
    undefined,
    () => createInitialState(initialCustomer)
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const draft = readDraft();
    if (draft) {
      dispatch({
        type: "HYDRATE",
        state: {
          ...draft,
          customer: {
            ...draft.customer,
            ...Object.fromEntries(
              Object.entries(initialCustomer ?? {}).filter(([, value]) => Boolean(value))
            )
          }
        }
      });
    }
    setHydrated(true);
  }, [initialCustomer]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(BOOKING_WIZARD_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota / private mode
    }
  }, [state, hydrated]);

  const { pricing, pricingError } = useMemo(() => {
    if (!state.selectedExperienceId || !state.selectedPackageId) {
      return { pricing: null, pricingError: null };
    }
    try {
      return {
        pricing: calculateBookingPricing({
          experienceId: state.selectedExperienceId,
          packageId: state.selectedPackageId,
          selectedUpgrades: state.selectedUpgrades,
          paymentOption: state.paymentOption,
          eventDateIso: state.schedule.date
        }),
        pricingError: null
      };
    } catch (error) {
      return {
        pricing: null,
        pricingError: error instanceof Error ? error.message : "Unable to calculate pricing."
      };
    }
  }, [state]);

  const goToStep = useCallback(
    (step: BookingWizardStepIndex) => {
      if (!canNavigateToStep(state, step) && step > state.currentStep) return false;
      dispatch({ type: "SET_STEP", step });
      return true;
    },
    [state]
  );

  const nextStep = useCallback(() => {
    const target = Math.min(5, state.currentStep + 1) as BookingWizardStepIndex;
    return goToStep(target);
  }, [goToStep, state.currentStep]);

  const prevStep = useCallback(() => {
    const target = Math.max(0, state.currentStep - 1) as BookingWizardStepIndex;
    dispatch({ type: "SET_STEP", step: target });
  }, [state.currentStep]);

  const clearDraft = useCallback(() => {
    dispatch({ type: "RESET" });
    try {
      window.sessionStorage.removeItem(BOOKING_WIZARD_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      pricing,
      pricingError,
      hydrated,
      goToStep,
      nextStep,
      prevStep,
      clearDraft
    }),
    [state, pricing, pricingError, hydrated, goToStep, nextStep, prevStep, clearDraft]
  );

  return <BookingWizardContext.Provider value={value}>{children}</BookingWizardContext.Provider>;
}

export function useBookingWizard() {
  const ctx = useContext(BookingWizardContext);
  if (!ctx) {
    throw new Error("useBookingWizard must be used within BookingWizardProvider.");
  }
  return ctx;
}
