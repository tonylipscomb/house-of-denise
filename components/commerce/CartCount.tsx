"use client";

import { useCart } from "./CartProvider";

export function CartCount() {
  const { itemCount, hydrated } = useCart();

  if (!hydrated || itemCount === 0) return null;

  return (
    <span className="lux-header__cart-count" aria-label={`${itemCount} item${itemCount === 1 ? "" : "s"} in cart`}>
      {itemCount > 99 ? "99+" : itemCount}
    </span>
  );
}
