export type DashboardKpi = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "gold" | "success" | "warning" | "danger";
};

export type RevenuePoint = {
  date: string;
  label: string;
  amountCents: number;
};

export type StatusCount = {
  status: string;
  label: string;
  count: number;
};

export type DashboardListItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  href?: string;
  status?: string;
  statusTone?: string;
};

export type ExperienceCount = {
  slug: string;
  label: string;
  count: number;
};

export type DashboardOverview = {
  kpis: DashboardKpi[];
  revenueSeries: RevenuePoint[];
  bookingStatusOverview: StatusCount[];
  upcomingEvents: DashboardListItem[];
  recentInquiries: DashboardListItem[];
  recentPayments: DashboardListItem[];
  recentCustomers: DashboardListItem[];
  topExperiences: ExperienceCount[];
  topPackages: ExperienceCount[];
  topUpgrades: ExperienceCount[];
};

export type AdminBookingListRow = {
  id: string;
  referenceNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  experienceSlug: string | null;
  packageSlug: string | null;
  eventDate: string | null;
  guestCount: number | null;
  status: string;
  paymentStatus: string;
  depositCents: number;
  totalCents: number;
  remainingCents: number;
  updatedAt: string;
};

export type AdminInquiryListRow = {
  id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  experienceFormat: string;
  guestCount: number;
  inquiryStatus: string;
  convertedBookingId: string | null;
  createdAt: string;
  submissionFingerprint: string | null;
};

export type AdminPaymentListRow = {
  id: string;
  source: "booking" | "commerce";
  customerName: string;
  customerEmail: string | null;
  reference: string;
  paymentType: string;
  amountCents: number;
  status: string;
  providerId: string | null;
  date: string;
  href?: string;
};
