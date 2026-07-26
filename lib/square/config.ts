import "server-only";
import { SquareEnvironment } from "square";

export type SquareRuntimeConfig = {
  environmentName: "sandbox" | "production";
  environment: SquareEnvironment;
  accessToken: string;
  applicationId: string;
  locationId: string;
  webhookSignatureKey?: string;
  siteUrl: string;
};

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return value;
}

export function getSquareConfig(): SquareRuntimeConfig {
  const environmentName =
    process.env.SQUARE_ENVIRONMENT?.trim().toLowerCase() === "production"
      ? "production"
      : "sandbox";

  return {
    environmentName,
    environment:
      environmentName === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
    accessToken: required("SQUARE_ACCESS_TOKEN"),
    applicationId: required("SQUARE_APPLICATION_ID"),
    locationId: required("SQUARE_LOCATION_ID"),
    webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim(),
    siteUrl:
      process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
      "http://localhost:3000",
  };
}
