import "server-only";

export type SupabaseKeyKind =
  | "service_role"
  | "anon"
  | "publishable"
  | "secret"
  | "stripe_secret"
  | "stripe_publishable"
  | "unknown";

export type SupabaseEnvSnapshot = {
  urlVarName: "SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_URL" | null;
  urlPresent: boolean;
  projectRef: string | null;
  serviceRoleVarName: "SUPABASE_SERVICE_ROLE_KEY" | null;
  serviceRolePresent: boolean;
  serviceRoleKeyKind: SupabaseKeyKind;
  serviceRoleKeyLength: number;
  anonVarName: "NEXT_PUBLIC_SUPABASE_ANON_KEY" | null;
  anonPresent: boolean;
  anonKeyKind: SupabaseKeyKind;
  anonKeyLength: number;
  anonProjectRef: string | null;
  serviceRoleProjectRef: string | null;
  projectKeyMismatch: boolean;
};

function firstDefined(
  ...entries: Array<{ name: string; value: string | undefined }>
): { name: string; value: string } | null {
  for (const entry of entries) {
    const value = entry.value?.trim();
    if (value) {
      return { name: entry.name, value };
    }
  }
  return null;
}

export function extractSupabaseProjectRef(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.trim().match(/^https?:\/\/([a-z0-9]+)\.supabase\.co\/?$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    const parsed = JSON.parse(json) as unknown;
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function classifySupabaseKey(value: string | null | undefined): {
  kind: SupabaseKeyKind;
  projectRef: string | null;
  length: number;
} {
  const key = value?.trim() ?? "";
  if (!key) {
    return { kind: "unknown", projectRef: null, length: 0 };
  }

  if (/^sk_(live|test)_/.test(key)) {
    return { kind: "stripe_secret", projectRef: null, length: key.length };
  }
  if (/^pk_(live|test)_/.test(key)) {
    return { kind: "stripe_publishable", projectRef: null, length: key.length };
  }
  if (key.startsWith("sb_publishable_")) {
    return { kind: "publishable", projectRef: null, length: key.length };
  }
  if (key.startsWith("sb_secret_")) {
    return { kind: "secret", projectRef: null, length: key.length };
  }

  if (key.startsWith("eyJ")) {
    const payload = decodeJwtPayload(key);
    const role = typeof payload?.role === "string" ? payload.role : null;
    const ref = typeof payload?.ref === "string" ? payload.ref.toLowerCase() : null;
    if (role === "service_role") {
      return { kind: "service_role", projectRef: ref, length: key.length };
    }
    if (role === "anon") {
      return { kind: "anon", projectRef: ref, length: key.length };
    }
    return { kind: "unknown", projectRef: ref, length: key.length };
  }

  return { kind: "unknown", projectRef: null, length: key.length };
}

export function getSupabaseEnvSnapshot(): SupabaseEnvSnapshot {
  const url = firstDefined(
    { name: "SUPABASE_URL", value: process.env.SUPABASE_URL },
    { name: "NEXT_PUBLIC_SUPABASE_URL", value: process.env.NEXT_PUBLIC_SUPABASE_URL }
  );
  const serviceRole = firstDefined({
    name: "SUPABASE_SERVICE_ROLE_KEY",
    value: process.env.SUPABASE_SERVICE_ROLE_KEY
  });
  const anon = firstDefined({
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });

  const serviceMeta = classifySupabaseKey(serviceRole?.value);
  const anonMeta = classifySupabaseKey(anon?.value);
  const projectRef = extractSupabaseProjectRef(url?.value);

  const projectKeyMismatch = Boolean(
    projectRef &&
      ((serviceMeta.projectRef && serviceMeta.projectRef !== projectRef) ||
        (anonMeta.projectRef && anonMeta.projectRef !== projectRef))
  );

  return {
    urlVarName: (url?.name as SupabaseEnvSnapshot["urlVarName"]) ?? null,
    urlPresent: Boolean(url),
    projectRef,
    serviceRoleVarName: serviceRole
      ? "SUPABASE_SERVICE_ROLE_KEY"
      : null,
    serviceRolePresent: Boolean(serviceRole),
    serviceRoleKeyKind: serviceMeta.kind,
    serviceRoleKeyLength: serviceMeta.length,
    anonVarName: anon ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
    anonPresent: Boolean(anon),
    anonKeyKind: anonMeta.kind,
    anonKeyLength: anonMeta.length,
    anonProjectRef: anonMeta.projectRef,
    serviceRoleProjectRef: serviceMeta.projectRef,
    projectKeyMismatch
  };
}

export function logSupabaseEnvDiagnostics(context: string) {
  const snapshot = getSupabaseEnvSnapshot();
  console.info(`[supabase-env] ${context}`, {
    urlVarName: snapshot.urlVarName,
    projectRef: snapshot.projectRef,
    serviceRoleVarName: snapshot.serviceRoleVarName,
    serviceRoleKeyKind: snapshot.serviceRoleKeyKind,
    serviceRoleKeyLength: snapshot.serviceRoleKeyLength,
    serviceRoleProjectRef: snapshot.serviceRoleProjectRef,
    anonVarName: snapshot.anonVarName,
    anonKeyKind: snapshot.anonKeyKind,
    anonKeyLength: snapshot.anonKeyLength,
    anonProjectRef: snapshot.anonProjectRef,
    projectKeyMismatch: snapshot.projectKeyMismatch
  });
  return snapshot;
}

export class SupabaseConfigError extends Error {
  readonly code:
    | "missing_supabase_url"
    | "missing_service_role_key"
    | "invalid_service_role_key"
    | "project_key_mismatch"
    | "supabase_auth_failure"
    | "database_error";

  constructor(
    code: SupabaseConfigError["code"],
    message: string
  ) {
    super(message);
    this.name = "SupabaseConfigError";
    this.code = code;
  }
}

export function assertAdminSupabaseConfig(): {
  url: string;
  serviceRoleKey: string;
  snapshot: SupabaseEnvSnapshot;
} {
  const snapshot = getSupabaseEnvSnapshot();

  if (!snapshot.urlPresent || !snapshot.urlVarName) {
    throw new SupabaseConfigError(
      "missing_supabase_url",
      "Supabase URL is not configured. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL."
    );
  }

  if (!snapshot.serviceRolePresent) {
    throw new SupabaseConfigError(
      "missing_service_role_key",
      "Supabase service-role key is not configured. Set SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  if (
    snapshot.serviceRoleKeyKind === "stripe_secret" ||
    snapshot.serviceRoleKeyKind === "stripe_publishable"
  ) {
    throw new SupabaseConfigError(
      "invalid_service_role_key",
      "SUPABASE_SERVICE_ROLE_KEY appears to contain a Stripe key. Use the Supabase service_role secret instead."
    );
  }

  if (
    snapshot.serviceRoleKeyKind !== "service_role" &&
    snapshot.serviceRoleKeyKind !== "secret"
  ) {
    throw new SupabaseConfigError(
      "invalid_service_role_key",
      "SUPABASE_SERVICE_ROLE_KEY is not a valid Supabase service-role credential (expected service_role JWT or sb_secret key)."
    );
  }

  if (snapshot.projectKeyMismatch) {
    throw new SupabaseConfigError(
      "project_key_mismatch",
      "Supabase project URL and API key project refs do not match. Update .env.local to the House of Denise project (vmieijypubtqgrftasac)."
    );
  }

  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    throw new SupabaseConfigError(
      "missing_service_role_key",
      "Supabase admin credentials are incomplete."
    );
  }

  return {
    url: url.replace(/\/+$/, ""),
    serviceRoleKey,
    snapshot
  };
}

export function classifySupabaseClientError(message: string): SupabaseConfigError {
  const normalized = message.toLowerCase();
  if (
    normalized.includes("invalid api key") ||
    normalized.includes("jwt") ||
    normalized.includes("unauthorized") ||
    normalized.includes("invalid authentication credentials")
  ) {
    return new SupabaseConfigError(
      "supabase_auth_failure",
      "Supabase rejected the service-role credentials. Confirm SUPABASE_SERVICE_ROLE_KEY belongs to the same project as SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL."
    );
  }

  return new SupabaseConfigError(
    "database_error",
    `Database request failed: ${message}`
  );
}
