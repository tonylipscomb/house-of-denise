"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  side?: "left" | "right";
  closeOnOverlayClick?: boolean;
  className?: string;
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  closeOnOverlayClick = true,
  className
}: DrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      panelRef.current?.focus();
    } else {
      document.body.style.overflow = "";
      triggerRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="overlay-root" role="presentation">
      <button
        type="button"
        className="overlay-backdrop"
        aria-label="Close panel"
        onClick={closeOnOverlayClick ? onClose : undefined}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn("drawer", side === "left" ? "drawer--left" : "drawer--right", className)}
        tabIndex={-1}
      >
        <div className="drawer__header">
          <h2 id={titleId} className="drawer__title">
            {title}
          </h2>
          <button type="button" className="icon-button drawer__close" onClick={onClose} aria-label="Close panel">
            <X size={20} />
          </button>
        </div>
        <div className="drawer__body">{children}</div>
      </div>
    </div>
  );
}
