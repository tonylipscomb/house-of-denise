import "server-only";
import { createClient } from "@supabase/supabase-js";
import type {
  CommerceItem,
  CommerceItemType,
  FulfillmentType,
} from "./catalog-types";

export type {
  CommerceItem,
  CommerceItemType,
  FulfillmentType,
} from "./catalog-types";

type CommerceItemRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  item_type: CommerceItemType;
  price_cents: number;
  active: boolean;
  image_url: string;
  fulfillment_type: FulfillmentType;
  square_catalog_variation_id: string | null;
  max_per_order: number;
  metadata: Record<string, unknown> | null;
};

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      "Commerce catalog requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

const SHOP_IMAGE_BY_SLUG: Record<string, string> = {
  "mobile-fragrance-bar-deposit":
    "/images/house-of-denise/shop-mobile-fragrance-bar.jpg",
  "private-event-deposit":
    "/images/house-of-denise/shop-private-events.jpg",
  "perfume-bar-experience":
    "/images/house-of-denise/shop-perfume-bar.jpg",
  "custom-fragrance-gift-set":
    "/images/house-of-denise/shop-custom-gift-set.jpg",
  "signature-fragrance-workshop":
    "/images/house-of-denise/shop-workshops.jpg",
};

function resolveCommerceImage(slug: string, imageUrl: string): string {
  return SHOP_IMAGE_BY_SLUG[slug] ?? imageUrl;
}

export function mapCommerceItem(row: CommerceItemRow): CommerceItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    itemType: row.item_type,
    priceInCents: row.price_cents,
    active: row.active,
    image: resolveCommerceImage(row.slug, row.image_url),
    fulfillmentType: row.fulfillment_type,
    squareCatalogVariationId:
      row.square_catalog_variation_id ?? undefined,
    inventory: {
      tracked: false,
      maxPerOrder: row.max_per_order,
    },
    metadata: row.metadata ?? {},
  };
}

export async function listCommerceItems(options?: {
  includeInactive?: boolean;
  includeDeleted?: boolean;
}): Promise<CommerceItem[]> {
  const supabase = adminClient();

  let query = supabase
    .from("commerce_items")
    .select(
      "id,slug,name,description,item_type,price_cents,active,image_url,fulfillment_type,square_catalog_variation_id,max_per_order,metadata",
    )
    .order("created_at", { ascending: false });

  if (!options?.includeInactive) {
    query = query.eq("active", true);
  }

  if (!options?.includeDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to load commerce catalog: ${error.message}`);
  }

  return (data as CommerceItemRow[]).map(mapCommerceItem);
}

export async function loadCommerceItemsByIds(
  ids: readonly string[],
): Promise<CommerceItem[]> {
  if (ids.length === 0) return [];

  const supabase = adminClient();
  const uniqueIds = [...new Set(ids)];

  const { data, error } = await supabase
    .from("commerce_items")
    .select(
      "id,slug,name,description,item_type,price_cents,active,image_url,fulfillment_type,square_catalog_variation_id,max_per_order,metadata",
    )
    .in("id", uniqueIds)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Unable to resolve commerce items: ${error.message}`);
  }

  return (data as CommerceItemRow[]).map(mapCommerceItem);
}
