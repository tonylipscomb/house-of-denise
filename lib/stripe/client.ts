import "server-only";

import Stripe from "stripe";
import { getStripeConfig } from "./config";

let productionClient: Stripe | null = null;

function createStripeClient() {
  return new Stripe(getStripeConfig().secretKey, {
    appInfo: {
      name: "House of Denise",
      version: "1.0.0",
    },
  });
}

export function getStripeClient(): Stripe {
  if (process.env.NODE_ENV !== "production") {
    return createStripeClient();
  }

  productionClient ??= createStripeClient();
  return productionClient;
}
