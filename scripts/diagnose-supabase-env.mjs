/**
 * Safe Supabase env diagnostics — never prints secret values.
 * Usage: node --env-file=.env.local scripts/diagnose-supabase-env.mjs
 */
import { createClient } from "@supabase/supabase-js";

function firstDefined(...entries) {
  for (const entry of entries) {
    const value = entry.value?.trim();
    if (value) return { name: entry.name, value };
  }
  return null;
}

function extractProjectRef(url) {
  const match = url?.trim().match(/^https?:\/\/([a-z0-9]+)\.supabase\.co\/?$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function classifyKey(value) {
  const key = value?.trim() ?? "";
  if (!key) return { kind: "unknown", projectRef: null, length: 0 };
  if (/^sk_(live|test)_/.test(key)) return { kind: "stripe_secret", projectRef: null, length: key.length };
  if (/^pk_(live|test)_/.test(key)) return { kind: "stripe_publishable", projectRef: null, length: key.length };
  if (key.startsWith("sb_publishable_")) return { kind: "publishable", projectRef: null, length: key.length };
  if (key.startsWith("sb_secret_")) return { kind: "secret", projectRef: null, length: key.length };
  if (key.startsWith("eyJ")) {
    const payload = decodeJwtPayload(key);
    const role = typeof payload?.role === "string" ? payload.role : null;
    const ref = typeof payload?.ref === "string" ? payload.ref.toLowerCase() : null;
    if (role === "service_role") return { kind: "service_role", projectRef: ref, length: key.length };
    if (role === "anon") return { kind: "anon", projectRef: ref, length: key.length };
    return { kind: "unknown", projectRef: ref, length: key.length };
  }
  return { kind: "unknown", projectRef: null, length: key.length };
}

const url = firstDefined(
  { name: "SUPABASE_URL", value: process.env.SUPABASE_URL },
  { name: "NEXT_PUBLIC_SUPABASE_URL", value: process.env.NEXT_PUBLIC_SUPABASE_URL }
);
const service = firstDefined({
  name: "SUPABASE_SERVICE_ROLE_KEY",
  value: process.env.SUPABASE_SERVICE_ROLE_KEY
});
const anon = firstDefined({
  name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});

const serviceMeta = classifyKey(service?.value);
const anonMeta = classifyKey(anon?.value);
const projectRef = extractProjectRef(url?.value);

const report = {
  urlVarName: url?.name ?? null,
  projectRef,
  serviceRoleVarName: service?.name ?? null,
  serviceRoleKeyKind: serviceMeta.kind,
  serviceRoleKeyLength: serviceMeta.length,
  serviceRoleProjectRef: serviceMeta.projectRef,
  anonVarName: anon?.name ?? null,
  anonKeyKind: anonMeta.kind,
  anonKeyLength: anonMeta.length,
  anonProjectRef: anonMeta.projectRef,
  projectKeyMismatch: Boolean(
    projectRef &&
      ((serviceMeta.projectRef && serviceMeta.projectRef !== projectRef) ||
        (anonMeta.projectRef && anonMeta.projectRef !== projectRef))
  ),
  staleProjectDetected: [projectRef, serviceMeta.projectRef, anonMeta.projectRef].includes(
    "hxukoiztumktahdpfdqq"
  ),
  expectedProjectRef: "vmieijypubtqgrftasac"
};

console.log(JSON.stringify(report, null, 2));

if (!url || !service || (serviceMeta.kind !== "service_role" && serviceMeta.kind !== "secret")) {
  console.error("Config invalid — fix env before probing Supabase.");
  process.exitCode = 1;
} else if (report.projectKeyMismatch || report.staleProjectDetected) {
  console.error("Project/key mismatch detected.");
  process.exitCode = 1;
} else {
  const admin = createClient(url.value.replace(/\/+$/, ""), service.value, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { error } = await admin.from("bookings").select("id").limit(1);
  if (error) {
    console.error(
      JSON.stringify(
        {
          probe: "bookings.select.limit(1)",
          ok: false,
          errorMessage: error.message,
          hint: "Credentials were shaped correctly but Supabase rejected the request."
        },
        null,
        2
      )
    );
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ probe: "bookings.select.limit(1)", ok: true }, null, 2));
  }
}
