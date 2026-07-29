import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [
        line.slice(0, index).trim(),
        line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "")
      ];
    })
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const email = "admin@houseofdenise.test";
const users = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
const user = users.data.users.find((entry) => (entry.email || "").toLowerCase() === email);

if (!user) {
  console.log("NO_USER");
  process.exit(1);
}

const membership = await admin
  .from("workspace_memberships")
  .select("*")
  .eq("user_id", user.id)
  .maybeSingle();

console.log(
  JSON.stringify(
    {
      userId: user.id,
      email: user.email,
      appRole: user.app_metadata?.role,
      membership: membership.data,
      membershipError: membership.error
    },
    null,
    2
  )
);
