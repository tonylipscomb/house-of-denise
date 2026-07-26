import "server-only";
import { loadCommerceItemsByIds } from "./catalog";
import {
  calculateSubtotalCents,
  createCheckoutReference,
  parseCheckoutPayload,
  resolveCheckoutLinesFromCatalog,
  type CheckoutPayload,
  type ResolvedCheckoutLine,
} from "./checkout-core";

export {
  calculateSubtotalCents,
  createCheckoutReference,
  parseCheckoutPayload,
  resolveCheckoutLinesFromCatalog,
};

export type {
  CheckoutInputItem,
  CheckoutPayload,
  ResolvedCheckoutLine,
} from "./checkout-core";

export async function resolveCheckoutLines(
  payload: CheckoutPayload,
): Promise<ResolvedCheckoutLine[]> {
  const catalog = await loadCommerceItemsByIds(
    payload.items.map((line) => line.itemId),
  );

  return resolveCheckoutLinesFromCatalog(payload, catalog);
}
