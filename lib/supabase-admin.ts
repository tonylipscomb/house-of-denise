import { getSupabaseAdminClient as getStandardSupabaseAdminClient } from "./supabase/admin";
import type { BookingInquiryRow } from "./supabase/types";

export type { BookingInquiryRow };

export function getSupabaseAdminClient() {
  return getStandardSupabaseAdminClient();
}
