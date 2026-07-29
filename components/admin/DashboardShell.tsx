"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";
import { ADMIN_NAV_ITEMS, isAdminNavActive } from "./nav";

type Props = {
  workspaceName: string;
  userLabel: string;
  role: string;
  children: React.ReactNode;
};

export function DashboardShell({
  workspaceName,
  userLabel,
  role,
  children
}: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const title = useMemo(() => {
    const match = ADMIN_NAV_ITEMS.find((item) => isAdminNavActive(pathname, item.href));
    return match?.label ?? "Dashboard";
  }, [pathname]);

  return (
    <div className="lp-admin">
      <DashboardSidebar
        workspaceName={workspaceName}
        userLabel={userLabel}
        role={role}
        open={open}
        onClose={() => setOpen(false)}
      />
      <div className="lp-admin__main">
        <DashboardTopbar title={title} onMenuClick={() => setOpen(true)} />
        <div className="lp-admin__content">{children}</div>
      </div>
    </div>
  );
}
