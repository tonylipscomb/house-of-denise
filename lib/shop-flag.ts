/** Public shop feature flag. Defaults to coming-soon when unset/false. */
export function isShopEnabled() {
  return process.env.NEXT_PUBLIC_SHOP_ENABLED === "true";
}
