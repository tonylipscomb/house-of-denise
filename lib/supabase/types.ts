export type WorkspaceRole = "customer" | "staff" | "admin" | "owner";
export type MembershipStatus = "invited" | "active" | "disabled";
export type WorkspaceStatus = "active" | "inactive" | "suspended";
export type BookingMode = "inquiry" | "direct";

export type Workspace = {
  id: string;
  slug: string;
  name: string;
  legal_name: string | null;
  status: WorkspaceStatus;
  timezone: string;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkspaceMembership = {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  status: MembershipStatus;
  created_at: string;
  updated_at: string;
};

export type WorkspaceSettings = {
  id: string;
  workspace_id: string;
  booking_enabled: boolean;
  default_timezone: string;
  currency: string;
  minimum_notice_hours: number | null;
  maximum_advance_days: number | null;
  default_slot_interval_minutes: number | null;
  maximum_bookings_per_day: number | null;
  guest_checkout_enabled: boolean;
  customer_accounts_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  workspace_id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category: string | null;
  booking_mode: BookingMode;
  active: boolean;
  featured: boolean;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ServiceVariant = {
  id: string;
  workspace_id: string;
  service_id: string;
  name: string;
  active: boolean;
  duration_minutes: number | null;
  setup_minutes: number | null;
  cleanup_minutes: number | null;
  travel_buffer_minutes: number | null;
  minimum_guest_count: number | null;
  maximum_guest_count: number | null;
  minimum_notice_hours: number | null;
  maximum_advance_days: number | null;
  price_amount: number | null;
  deposit_amount: number | null;
  deposit_percentage: number | null;
  currency: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  workspace_id: string;
  reference_number: string;
  customer_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  service_id: string | null;
  service_variant_id: string | null;
  staff_profile_id: string | null;
  start_at: string | null;
  end_at: string | null;
  timezone: string | null;
  guest_count: number | null;
  status: string;
  payment_status: string;
  source: string;
  customer_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingInquiryRow = {
  id: string;
  workspace_id: string | null;
  customer_id: string | null;
  assigned_user_id: string | null;
  converted_booking_id: string | null;
  reference_number: string;
  full_name: string;
  email: string;
  phone: string;
  preferred_contact_method: string | null;
  event_type: string;
  event_date: string;
  event_start_time: string | null;
  venue_name: string | null;
  event_city: string;
  event_state: string | null;
  event_zip: string | null;
  estimated_guest_count: number;
  experience_format: string;
  event_description: string | null;
  special_requests: string | null;
  referral_source: string | null;
  consent_accepted: boolean;
  inquiry_status: "new" | "reviewing" | "followed-up" | "closed";
  deposit_status: "not_requested" | "pending" | "paid" | "waived";
  square_checkout_reference: string | null;
  square_payment_reference: string | null;
  owner_email_status: "pending" | "sent" | "failed";
  customer_email_status: "pending" | "sent" | "failed";
  submission_fingerprint: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      workspaces: { Row: Workspace; Insert: Partial<Workspace> & Pick<Workspace, "slug" | "name">; Update: Partial<Workspace>; Relationships: [] };
      profiles: { Row: Profile; Insert: Partial<Profile> & Pick<Profile, "id">; Update: Partial<Profile>; Relationships: [] };
      workspace_memberships: { Row: WorkspaceMembership; Insert: Partial<WorkspaceMembership> & Pick<WorkspaceMembership, "workspace_id" | "user_id" | "role">; Update: Partial<WorkspaceMembership>; Relationships: [] };
      workspace_settings: { Row: WorkspaceSettings; Insert: Partial<WorkspaceSettings> & Pick<WorkspaceSettings, "workspace_id">; Update: Partial<WorkspaceSettings>; Relationships: [] };
      services: { Row: Service; Insert: Partial<Service> & Pick<Service, "workspace_id" | "slug" | "name">; Update: Partial<Service>; Relationships: [] };
      service_variants: { Row: ServiceVariant; Insert: Partial<ServiceVariant> & Pick<ServiceVariant, "workspace_id" | "service_id" | "name">; Update: Partial<ServiceVariant>; Relationships: [] };
      bookings: { Row: Booking; Insert: Partial<Booking> & Pick<Booking, "workspace_id" | "reference_number">; Update: Partial<Booking>; Relationships: [] };
      booking_inquiries: {
        Row: BookingInquiryRow;
        Insert: Partial<BookingInquiryRow> & Pick<BookingInquiryRow, "reference_number" | "full_name" | "email" | "phone" | "event_type" | "event_date" | "event_city" | "estimated_guest_count" | "experience_format" | "consent_accepted">;
        Update: Partial<BookingInquiryRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
