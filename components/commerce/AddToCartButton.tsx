"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

type Props = {
  item: {
    itemId: string;
    slug: string;
    name: string;
    priceInCents: number;
    image: string;
    itemType: string;
    fulfillmentType: string;
    maxPerOrder: number;
  };
};

export function AddToCartButton({ item }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addItem(item);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      style={{
        width: "100%",
        border: 0,
        borderRadius: "999px",
        padding: "0.85rem 1.1rem",
        background: "#191310",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
