export type AdminNavItem = {
  id: string;
  label: string;
  href: string;
  phase: 1 | 2 | 3;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: "overview", label: "Overview", href: "/admin", phase: 1 },
  { id: "bookings", label: "Bookings", href: "/admin/bookings", phase: 1 },
  { id: "inquiries", label: "Inquiries", href: "/admin/inquiries", phase: 1 },
  { id: "calendar", label: "Calendar", href: "/admin/calendar", phase: 1 },
  { id: "customers", label: "Customers", href: "/admin/customers", phase: 1 },
  { id: "experiences", label: "Experiences", href: "/admin/experiences", phase: 1 },
  { id: "packages", label: "Packages & Upgrades", href: "/admin/packages", phase: 1 },
  { id: "payments", label: "Payments", href: "/admin/payments", phase: 1 },
  { id: "products", label: "Products", href: "/admin/products", phase: 3 },
  { id: "coupons", label: "Coupons", href: "/admin/coupons", phase: 3 },
  { id: "newsletter", label: "Newsletter", href: "/admin/newsletter", phase: 3 },
  { id: "settings", label: "Settings", href: "/admin/settings", phase: 1 }
];

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
