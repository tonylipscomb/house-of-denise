export type CommerceItemType =
  | "product"
  | "experience"
  | "workshop"
  | "deposit";

export type FulfillmentType =
  | "shipping"
  | "pickup"
  | "booking"
  | "digital";

export type CommerceItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  itemType: CommerceItemType;
  priceInCents: number;
  active: boolean;
  image: string;
  fulfillmentType: FulfillmentType;
  squareCatalogVariationId?: string;
  inventory: {
    tracked: boolean;
    maxPerOrder: number;
  };
  metadata: Record<string, unknown>;
};
