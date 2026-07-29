import "server-only";

export type StripeRuntimeConfig = {
  secretKey: string;
  webhookSecret?: string;
  siteUrl: string;
};

function required(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

export function getStripeConfig(): StripeRuntimeConfig {
  return {
    secretKey: required("STRIPE_SECRET_KEY"),
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.trim(),
    siteUrl:
      process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
      "http://localhost:3000",
  };
}
