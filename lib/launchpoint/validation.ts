import type { BookingMode } from "../supabase/types";

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: Record<string, string> };

export type ServiceInput = {
  name: string;
  slug: string;
  category?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  bookingMode: BookingMode;
  active: boolean;
  featured: boolean;
  imageUrl?: string | null;
  sortOrder: number;
};

export type VariantInput = {
  name: string;
  active: boolean;
  durationMinutes?: number | null;
  setupMinutes?: number | null;
  cleanupMinutes?: number | null;
  travelBufferMinutes?: number | null;
  minimumGuestCount?: number | null;
  maximumGuestCount?: number | null;
  minimumNoticeHours?: number | null;
  maximumAdvanceDays?: number | null;
  priceAmount?: number | null;
  depositAmount?: number | null;
  depositPercentage?: number | null;
  currency: string;
  sortOrder: number;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

function numberOrNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function boolFromForm(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

export function parseServiceForm(formData: FormData): ValidationResult<ServiceInput> {
  const errors: Record<string, string> = {};
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const bookingMode = String(formData.get("bookingMode") ?? "inquiry") as BookingMode;
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!name) errors.name = "Service name is required.";
  if (!slugPattern.test(slug)) errors.slug = "Use lowercase letters, numbers, and hyphens.";
  if (bookingMode !== "inquiry" && bookingMode !== "direct") errors.bookingMode = "Choose a valid booking mode.";
  if (!Number.isInteger(sortOrder) || sortOrder < 0) errors.sortOrder = "Sort order must be zero or greater.";

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name,
      slug,
      category: optionalString(formData.get("category")),
      shortDescription: optionalString(formData.get("shortDescription")),
      description: optionalString(formData.get("description")),
      bookingMode,
      active: boolFromForm(formData.get("active")),
      featured: boolFromForm(formData.get("featured")),
      imageUrl: optionalString(formData.get("imageUrl")),
      sortOrder
    }
  };
}

export function parseVariantForm(formData: FormData): ValidationResult<VariantInput> {
  const errors: Record<string, string> = {};
  const name = String(formData.get("variantName") ?? "").trim();
  const currency = String(formData.get("currency") ?? "USD").trim().toUpperCase();
  const fields = {
    durationMinutes: numberOrNull(formData.get("durationMinutes")),
    setupMinutes: numberOrNull(formData.get("setupMinutes")),
    cleanupMinutes: numberOrNull(formData.get("cleanupMinutes")),
    travelBufferMinutes: numberOrNull(formData.get("travelBufferMinutes")),
    minimumGuestCount: numberOrNull(formData.get("minimumGuestCount")),
    maximumGuestCount: numberOrNull(formData.get("maximumGuestCount")),
    minimumNoticeHours: numberOrNull(formData.get("minimumNoticeHours")),
    maximumAdvanceDays: numberOrNull(formData.get("maximumAdvanceDays")),
    priceAmount: numberOrNull(formData.get("priceAmount")),
    depositAmount: numberOrNull(formData.get("depositAmount")),
    depositPercentage: numberOrNull(formData.get("depositPercentage")),
    sortOrder: Number(formData.get("variantSortOrder") ?? 0)
  };

  if (!name) errors.variantName = "Variant name is required.";
  if (!/^[A-Z]{3}$/.test(currency)) errors.currency = "Use a three-letter currency code.";

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== null && (!Number.isFinite(value) || value < 0)) {
      errors[key] = "Use a zero or positive number.";
    }
  });

  if (fields.minimumGuestCount && fields.maximumGuestCount && fields.minimumGuestCount > fields.maximumGuestCount) {
    errors.maximumGuestCount = "Maximum guests must be greater than minimum guests.";
  }

  if (fields.depositPercentage !== null && fields.depositPercentage > 100) {
    errors.depositPercentage = "Deposit percentage cannot exceed 100.";
  }

  if (!Number.isInteger(fields.sortOrder)) errors.variantSortOrder = "Sort order must be a whole number.";

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name,
      active: boolFromForm(formData.get("variantActive")),
      currency,
      ...fields
    }
  };
}
