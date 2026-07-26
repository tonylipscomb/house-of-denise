"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  itemId: string;
  slug: string;
  name: string;
  priceInCents: number;
  image: string;
  itemType: string;
  fulfillmentType: string;
  quantity: number;
  maxPerOrder: number;
  selectedOptions: Record<string, string>;
};

type AddCartItem = Omit<CartItem, "quantity" | "selectedOptions"> & {
  quantity?: number;
  selectedOptions?: Record<string, string>;
};

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  itemCount: number;
  subtotalCents: number;
  addItem: (item: AddCartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "house-of-denise-commerce-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function normalizeQuantity(value: number, maximum: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(Math.trunc(value), maximum));
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.itemId === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.priceInCents === "number" &&
    typeof item.image === "string" &&
    typeof item.itemType === "string" &&
    typeof item.fulfillmentType === "string" &&
    typeof item.quantity === "number" &&
    typeof item.maxPerOrder === "number" &&
    Boolean(item.selectedOptions) &&
    typeof item.selectedOptions === "object" &&
    !Array.isArray(item.selectedOptions)
  );
}

function readStoredCart(): CartItem[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isCartItem)
      .map((item) => ({
        ...item,
        quantity: normalizeQuantity(
          item.quantity,
          Math.max(1, item.maxPerOrder),
        ),
      }));
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(readStoredCart());
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items),
    );
  }, [hydrated, items]);

  const addItem = useCallback((incoming: AddCartItem) => {
    setItems((current) => {
      const existing = current.find(
        (item) => item.itemId === incoming.itemId,
      );

      if (existing) {
        return current.map((item) =>
          item.itemId === incoming.itemId
            ? {
                ...item,
                quantity: normalizeQuantity(
                  item.quantity + (incoming.quantity ?? 1),
                  item.maxPerOrder,
                ),
              }
            : item,
        );
      }

      return [
        ...current,
        {
          ...incoming,
          quantity: normalizeQuantity(
            incoming.quantity ?? 1,
            incoming.maxPerOrder,
          ),
          selectedOptions: incoming.selectedOptions ?? {},
        },
      ];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((current) =>
      current.filter((item) => item.itemId !== itemId),
    );
  }, []);

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      setItems((current) =>
        current.map((item) =>
          item.itemId === itemId
            ? {
                ...item,
                quantity: normalizeQuantity(
                  quantity,
                  item.maxPerOrder,
                ),
              }
            : item,
        ),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
    [items],
  );

  const subtotalCents = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.priceInCents * item.quantity,
        0,
      ),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      hydrated,
      itemCount,
      subtotalCents,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [
      items,
      hydrated,
      itemCount,
      subtotalCents,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return context;
}
