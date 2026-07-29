import "server-only";

import { getSquareConfig } from "./config";

type SquareApiError = {
  category?: string;
  code?: string;
  detail?: string;
};

type SquareErrorResponse = {
  errors?: SquareApiError[];
};

export function getSquareApiBaseUrl(): string {
  return getSquareConfig().environmentName === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export async function squareFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const config = getSquareConfig();

  const response = await fetch(`${getSquareApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await response.text();

  let payload: T & SquareErrorResponse;

  try {
    payload = text
      ? (JSON.parse(text) as T & SquareErrorResponse)
      : ({} as T & SquareErrorResponse);
  } catch {
    throw new Error(
      `Square returned an unreadable response with status ${response.status}.`,
    );
  }

  if (!response.ok) {
    const detail =
      payload.errors
        ?.map((error: SquareApiError) => error.detail || error.code)
        .filter((value): value is string => Boolean(value))
        .join("; ") ||
      `Square API request failed with status ${response.status}.`;

    throw new Error(detail);
  }

  return payload;
}
