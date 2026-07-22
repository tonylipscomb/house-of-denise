import assert from "node:assert/strict";
import test from "node:test";
import { hasWorkspaceRole } from "../lib/launchpoint/permissions.ts";
import { parseServiceForm, parseVariantForm } from "../lib/launchpoint/validation.ts";

function form(input: Record<string, string>) {
  const data = new FormData();
  Object.entries(input).forEach(([key, value]) => data.set(key, value));
  return data;
}

test("role permission matrix allows only admin and owner into admin portal", () => {
  assert.equal(hasWorkspaceRole("customer", ["admin", "owner"]), false);
  assert.equal(hasWorkspaceRole("staff", ["admin", "owner"]), false);
  assert.equal(hasWorkspaceRole("admin", ["admin", "owner"]), true);
  assert.equal(hasWorkspaceRole("owner", ["admin", "owner"]), true);
});

test("service validation accepts tenant-safe service fields", () => {
  const result = parseServiceForm(
    form({
      name: "Mobile Fragrance Bar",
      slug: "mobile-fragrance-bar",
      bookingMode: "inquiry",
      sortOrder: "10",
      active: "on"
    })
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.slug, "mobile-fragrance-bar");
    assert.equal(result.value.active, true);
  }
});

test("service validation rejects invalid slugs and browser-supplied roles are ignored", () => {
  const result = parseServiceForm(
    form({
      name: "VIP",
      slug: "../admin",
      bookingMode: "direct",
      sortOrder: "0",
      role: "owner"
    })
  );

  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors.slug, /lowercase/);
});

test("variant validation rejects negative money and impossible deposits", () => {
  const result = parseVariantForm(
    form({
      variantName: "Standard",
      currency: "USD",
      durationMinutes: "60",
      priceAmount: "-1",
      depositPercentage: "120",
      variantSortOrder: "0"
    })
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.errors.priceAmount, /zero/);
    assert.match(result.errors.depositPercentage, /100/);
  }
});

test("variant validation rejects cross-field guest ranges", () => {
  const result = parseVariantForm(
    form({
      variantName: "Group",
      currency: "USD",
      minimumGuestCount: "20",
      maximumGuestCount: "10",
      variantSortOrder: "0"
    })
  );

  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors.maximumGuestCount, /greater/);
});
