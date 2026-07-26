import { randomUUID } from "node:crypto";
import type { CommerceItem } from "./catalog-types";

export type CheckoutInputItem = {
  itemId: string;
  quantity: number;
  selectedOptions?: Record<string, string>;
};

export type CheckoutPayload = {
  items: CheckoutInputItem[];
  customerEmail?: string;
  customerPhone?: string;
  fulfillmentDetails?: Record<string, unknown>;
};

export type ResolvedCheckoutLine = {
  item: CommerceItem;
  quantity: number;
  selectedOptions: Record<string, string>;
  lineTotalCents: number;
};

const MAX_CART_LINES = 25;
const MAX_QUANTITY = 20;

export function parseCheckoutPayload(value: unknown): CheckoutPayload {
  if (!value || typeof value !== "object") {
    throw new Error("Checkout payload must be an object.");
  }

  const candidate = value as Record<string, unknown>;

  if (!Array.isArray(candidate.items) || candidate.items.length === 0) {
    throw new Error("Checkout requires at least one item.");
  }

  if (candidate.items.length > MAX_CART_LINES) {
    throw new Error("Checkout contains too many line items.");
  }

  const items = candidate.items.map((raw) => {
    if (!raw || typeof raw !== "object") {
      throw new Error("Malformed checkout item.");
    }

    const line = raw as Record<string, unknown>;

    if (typeof line.itemId !== "string" || !line.itemId.trim()) {
      throw new Error("Each checkout item requires an itemId.");
    }

    if (
      typeof line.quantity !== "number" ||
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > MAX_QUANTITY
    ) {
      throw new Error(
        `Quantity must be an integer between 1 and ${MAX_QUANTITY}.`,
      );
    }

    const selectedOptions: Record<string, string> = {};

    if (line.selectedOptions !== undefined) {
      if (
        !line.selectedOptions ||
        typeof line.selectedOptions !== "object" ||
        Array.isArray(line.selectedOptions)
      ) {
        throw new Error("Selected options must be a simple object.");
      }

      for (const [key, optionValue] of Object.entries(
        line.selectedOptions as Record<string, unknown>,
      )) {
        if (
          key.length > 60 ||
          typeof optionValue !== "string" ||
          optionValue.length > 200
        ) {
          throw new Error("A selected option is invalid.");
        }

        selectedOptions[key] = optionValue;
      }
    }

    return {
      itemId: line.itemId.trim(),
      quantity: line.quantity,
      selectedOptions,
    };
  });

  const customerEmail =
    typeof candidate.customerEmail === "string"
      ? candidate.customerEmail.trim().toLowerCase()
      : undefined;

  if (
    customerEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
  ) {
    throw new Error("Customer email is invalid.");
  }

  const customerPhone =
    typeof candidate.customerPhone === "string"
      ? candidate.customerPhone.trim()
      : undefined;

  if (customerPhone && customerPhone.length > 30) {
    throw new Error("Customer phone is invalid.");
  }

  const fulfillmentDetails =
    candidate.fulfillmentDetails &&
    typeof candidate.fulfillmentDetails === "object" &&
    !Array.isArray(candidate.fulfillmentDetails)
      ? (candidate.fulfillmentDetails as Record<string, unknown>)
      : undefined;

  return {
    items,
    customerEmail,
    customerPhone,
    fulfillmentDetails,
  };
}

export function resolveCheckoutLinesFromCatalog(
  payload: CheckoutPayload,
  catalog: readonly CommerceItem[],
): ResolvedCheckoutLine[] {
  const itemsById = new Map(catalog.map((item) => [item.id, item]));

  return payload.items.map((line) => {
    const item = itemsById.get(line.itemId);

    if (!item) {
      throw new Error(`Unknown commerce item: ${line.itemId}`);
    }

    if (!item.active) {
      throw new Error(`Inactive commerce item: ${line.itemId}`);
    }

    const max = item.inventory.maxPerOrder;

    if (line.quantity > max) {
      throw new Error(
        `${item.name} allows a maximum quantity of ${max}.`,
      );
    }

    return {
      item,
      quantity: line.quantity,
      selectedOptions: line.selectedOptions ?? {},
      lineTotalCents: item.priceInCents * line.quantity,
    };
  });
}

export function calculateSubtotalCents(
  lines: readonly ResolvedCheckoutLine[],
): number {
  return lines.reduce(
    (sum, line) => sum + line.lineTotalCents,
    0,
  );
}

export function createCheckoutReference(): string {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  return `HOD-${date}-${randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;
}
