import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
      return [key, value];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase URL or service role key in .env.local");
  process.exit(1);
}

const WORKSPACE_ID = "7a0ee776-8d6f-4d75-b4b3-a9f5d94f8861";
const email = "admin@houseofdenise.test";
const password = "HodAdmin2026!";
const fullName = "House of Denise Admin";

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
if (listed.error) {
  console.error("listUsers failed:", listed.error.message);
  process.exit(1);
}

let user = (listed.data.users || []).find(
  (entry) => (entry.email || "").toLowerCase() === email
);

if (!user) {
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
    app_metadata: { role: "owner" }
  });

  if (created.error) {
    console.error("createUser failed:", created.error.message);
    process.exit(1);
  }

  user = created.data.user;
  console.log("CREATED_USER");
} else {
  const updated = await admin.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
    app_metadata: { ...(user.app_metadata || {}), role: "owner" }
  });

  if (updated.error) {
    console.error("updateUser failed:", updated.error.message);
    process.exit(1);
  }

  user = updated.data.user;
  console.log("UPDATED_EXISTING_USER");
}

const profile = await admin.from("profiles").upsert(
  {
    id: user.id,
    email,
    full_name: fullName
  },
  { onConflict: "id" }
);

if (profile.error) {
  console.error("profile upsert failed:", profile.error.message);
  process.exit(1);
}

const membership = await admin.from("workspace_memberships").upsert(
  {
    workspace_id: WORKSPACE_ID,
    user_id: user.id,
    role: "owner",
    status: "active"
  },
  { onConflict: "workspace_id,user_id" }
);

if (membership.error) {
  console.error("membership upsert failed:", membership.error.message);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      email,
      password,
      userId: user.id,
      role: "owner",
      loginUrl: "http://localhost:3001/admin/login"
    },
    null,
    2
  )
);
