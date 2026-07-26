import assert from "node:assert/strict";
import test from "node:test";
import type { CommerceItem } from "../lib/commerce/catalog-types.ts";
import {
  calculateSubtotalCents,
  parseCheckoutPayload,
  resolveCheckoutLinesFromCatalog,
} from "../lib/commerce/checkout-core.ts";

const catalog: CommerceItem[] = [
  {
    id: "deposit-1",
    slug: "private-event-deposit",
    name: "Private Event Deposit",
    description: "Test listing",
    itemType: "deposit",
    priceInCents: 17500,
    active: true,
    image: "",
    fulfillmentType: "booking",
    inventory: {
      tracked: false,
      maxPerOrder: 1,
    },
    metadata: {},
  },
  {
    id: "inactive-1",
    slug: "inactive-workshop",
    name: "Inactive Workshop",
    description: "Test listing",
    itemType: "workshop",
    priceInCents: 6500,
    active: false,
    image: "",
    fulfillmentType: "booking",
    inventory: {
      tracked: false,
      maxPerOrder: 10,
    },
    metadata: {},
  },
];

test("trusted catalog resolves active item and calculates subtotal", () => {
  const payload = parseCheckoutPayload({
    items: [{ itemId: "deposit-1", quantity: 1 }],
  });

  const lines = resolveCheckoutLinesFromCatalog(payload, catalog);

  assert.equal(lines[0]?.item.name, "Private Event Deposit");
  assert.equal(calculateSubtotalCents(lines), 17500);
});

test("browser price is ignored", () => {
  const payload = parseCheckoutPayload({
    items: [
      {
        itemId: "deposit-1",
        quantity: 1,
        priceInCents: 1,
      },
    ],
  });

  const lines = resolveCheckoutLinesFromCatalog(payload, catalog);

  assert.equal(calculateSubtotalCents(lines), 17500);
});

test("invalid item is rejected", () => {
  const payload = parseCheckoutPayload({
    items: [{ itemId: "does-not-exist", quantity: 1 }],
  });

  assert.throws(
    () => resolveCheckoutLinesFromCatalog(payload, catalog),
    /Unknown commerce item/,
  );
});

test("inactive item is rejected", () => {
  const payload = parseCheckoutPayload({
    items: [{ itemId: "inactive-1", quantity: 1 }],
  });

  assert.throws(
    () => resolveCheckoutLinesFromCatalog(payload, catalog),
    /Inactive commerce item/,
  );
});

test("invalid quantity is rejected", () => {
  assert.throws(
    () =>
      parseCheckoutPayload({
        items: [{ itemId: "deposit-1", quantity: 0 }],
      }),
    /Quantity/,
  );
});

test("item maximum quantity is enforced", () => {
  const payload = parseCheckoutPayload({
    items: [{ itemId: "deposit-1", quantity: 2 }],
  });

  assert.throws(
    () => resolveCheckoutLinesFromCatalog(payload, catalog),
    /maximum quantity of 1/,
  );
});

test("malformed checkout payload is rejected", () => {
  assert.throws(
    () => parseCheckoutPayload({}),
    /at least one item/,
  );
});
