import type {
  BookingExperienceId,
  BookingPackageId,
  BookingUpgradeId
} from "@/data/booking-catalog";
import {
  indoorOutdoorOptions,
  occasionOptions,
  preferredContactOptions,
  eventTypeOptionsWizard
} from "@/data/booking-catalog";

export const BOOKING_WIZARD_STORAGE_KEY = "hod-booking-wizard-v1";
export const BOOKING_WIZARD_STEPS = [
  "Experience",
  "Details",
  "Package",
  "Schedule",
  "Review",
  "Payment"
] as const;

export type BookingWizardStepIndex = 0 | 1 | 2 | 3 | 4 | 5;

export type BookingEventDetails = {
  occasion: (typeof occasionOptions)[number] | "";
  eventType: (typeof eventTypeOptionsWizard)[number] | "";
  guestCount: number | null;
  indoorOutdoor: (typeof indoorOutdoorOptions)[number] | "";
  venueName: string;
  address: string;
  specialRequests: string;
  accessibilityNeeds: string;
  additionalNotes: string;
};

export type BookingScheduleState = {
  date: string | null; // YYYY-MM-DD
  timeSlotId: string | null;
  timeLabel: string | null;
  timezone: string;
};

export type BookingCustomerState = {
  fullName: string;
  email: string;
  phone: string;
  preferredContactMethod: (typeof preferredContactOptions)[number] | "";
};

export type BookingWizardState = {
  version: 1;
  currentStep: BookingWizardStepIndex;
  selectedExperienceId: BookingExperienceId | null;
  selectedPackageId: BookingPackageId | null;
  selectedUpgrades: Array<{ id: BookingUpgradeId; quantity: number }>;
  eventDetails: BookingEventDetails;
  schedule: BookingScheduleState;
  customer: BookingCustomerState;
  paymentOption: "deposit" | "full";
  termsAccepted: boolean;
  updatedAt: string;
};

export type BookingWizardAction =
  | { type: "HYDRATE"; state: BookingWizardState }
  | { type: "SET_STEP"; step: BookingWizardStepIndex }
  | { type: "SELECT_EXPERIENCE"; experienceId: BookingExperienceId }
  | { type: "SET_EVENT_DETAILS"; details: Partial<BookingEventDetails> }
  | { type: "SELECT_PACKAGE"; packageId: BookingPackageId }
  | {
      type: "SET_UPGRADE";
      upgradeId: BookingUpgradeId;
      selected: boolean;
      quantity?: number;
    }
  | { type: "SET_SCHEDULE"; schedule: Partial<BookingScheduleState> }
  | { type: "SET_CUSTOMER"; customer: Partial<BookingCustomerState> }
  | { type: "SET_PAYMENT_OPTION"; paymentOption: "deposit" | "full" }
  | { type: "SET_TERMS"; accepted: boolean }
  | { type: "RESET" };

export function createEmptyWizardState(): BookingWizardState {
  return {
    version: 1,
    currentStep: 0,
    selectedExperienceId: null,
    selectedPackageId: null,
    selectedUpgrades: [],
    eventDetails: {
      occasion: "",
      eventType: "",
      guestCount: null,
      indoorOutdoor: "",
      venueName: "",
      address: "",
      specialRequests: "",
      accessibilityNeeds: "",
      additionalNotes: ""
    },
    schedule: {
      date: null,
      timeSlotId: null,
      timeLabel: null,
      timezone: "America/New_York"
    },
    customer: {
      fullName: "",
      email: "",
      phone: "",
      preferredContactMethod: ""
    },
    paymentOption: "deposit",
    termsAccepted: false,
    updatedAt: new Date().toISOString()
  };
}

export function bookingWizardReducer(
  state: BookingWizardState,
  action: BookingWizardAction
): BookingWizardState {
  const stamp = () => new Date().toISOString();

  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "SET_STEP":
      return { ...state, currentStep: action.step, updatedAt: stamp() };
    case "SELECT_EXPERIENCE":
      return {
        ...state,
        selectedExperienceId: action.experienceId,
        selectedPackageId: null,
        selectedUpgrades: [],
        currentStep: 1,
        updatedAt: stamp()
      };
    case "SET_EVENT_DETAILS":
      return {
        ...state,
        eventDetails: { ...state.eventDetails, ...action.details },
        updatedAt: stamp()
      };
    case "SELECT_PACKAGE":
      return {
        ...state,
        selectedPackageId: action.packageId,
        updatedAt: stamp()
      };
    case "SET_UPGRADE": {
      const existing = state.selectedUpgrades.filter((item) => item.id !== action.upgradeId);
      if (!action.selected) {
        return { ...state, selectedUpgrades: existing, updatedAt: stamp() };
      }
      return {
        ...state,
        selectedUpgrades: [
          ...existing,
          { id: action.upgradeId, quantity: action.quantity ?? 1 }
        ],
        updatedAt: stamp()
      };
    }
    case "SET_SCHEDULE":
      return {
        ...state,
        schedule: { ...state.schedule, ...action.schedule },
        updatedAt: stamp()
      };
    case "SET_CUSTOMER":
      return {
        ...state,
        customer: { ...state.customer, ...action.customer },
        updatedAt: stamp()
      };
    case "SET_PAYMENT_OPTION":
      return { ...state, paymentOption: action.paymentOption, updatedAt: stamp() };
    case "SET_TERMS":
      return { ...state, termsAccepted: action.accepted, updatedAt: stamp() };
    case "RESET":
      return createEmptyWizardState();
    default:
      return state;
  }
}

export function canNavigateToStep(state: BookingWizardState, target: BookingWizardStepIndex): boolean {
  if (target <= state.currentStep) return true;
  if (target === 1) return Boolean(state.selectedExperienceId);
  if (target === 2) {
    return Boolean(
      state.selectedExperienceId &&
        state.eventDetails.occasion &&
        state.eventDetails.eventType &&
        state.eventDetails.guestCount &&
        state.eventDetails.venueName &&
        state.eventDetails.address
    );
  }
  if (target === 3) {
    return canNavigateToStep(state, 2) && Boolean(state.selectedPackageId);
  }
  if (target === 4) {
    return (
      canNavigateToStep(state, 3) &&
      Boolean(state.schedule.date && state.schedule.timeSlotId)
    );
  }
  if (target === 5) {
    return (
      canNavigateToStep(state, 4) &&
      Boolean(state.customer.fullName && state.customer.email && state.customer.phone)
    );
  }
  return false;
}
