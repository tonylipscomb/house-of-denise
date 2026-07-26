import "server-only";
import { SquareClient } from "square";
import { getSquareConfig } from "./config";

let client: SquareClient | undefined;

export function getSquareClient(): SquareClient {
  if (!client) {
    const config = getSquareConfig();
    client = new SquareClient({
      token: config.accessToken,
      environment: config.environment,
    });
  }
  return client;
}
