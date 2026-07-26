"use client";

import { useCart } from "./CartProvider";

export function CartCount() {
  const { itemCount, hydrated } = useCart();

  if (!hydrated || itemCount === 0) return null;

  return (
    <span
      aria-label={`${itemCount} item${itemCount === 1 ? "" : "s"} in cart`}
      style={{
        display: "inline-grid",
        placeItems: "center",
        minWidth: "1.4rem",
        height: "1.4rem",
        padding: "0 0.35rem",
        borderRadius: "999px",
        background: "#191310",
        color: "#fff",
        fontSize: "0.75rem",
        fontWeight: 700,
      }}
    >
      {itemCount}
    </span>
  );
}
