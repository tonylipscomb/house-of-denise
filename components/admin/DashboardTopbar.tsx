"use client";

import { LogOut, Menu } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";

type Props = {
  title: string;
  onMenuClick: () => void;
};

export function DashboardTopbar({ title, onMenuClick }: Props) {
  return (
    <header className="lp-admin__topbar">
      <div className="lp-admin__topbar-left">
        <button
          type="button"
          className="lp-admin__icon-btn lp-admin__menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
        <div>
          <p className="lp-admin__topbar-eyebrow">Admin</p>
          <h2 className="lp-admin__topbar-title">{title}</h2>
        </div>
      </div>
      <form action={logoutAction}>
        <button type="submit" className="lp-admin__logout">
          <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
          Log out
        </button>
      </form>
    </header>
  );
}
