"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { brand } from "@/data/brand";
import { bookingNav, primaryNav } from "@/data/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const bookingTriggerRef = useRef<HTMLButtonElement>(null);
  const bookingMenuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const closeBookingMenu = (returnFocus = true) => {
    setBookingOpen(false);
    if (returnFocus) {
      bookingTriggerRef.current?.focus();
    }
  };

  useEffect(() => {
    if (!bookingOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeBookingMenu(true);
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (bookingMenuRef.current?.contains(target) || bookingTriggerRef.current?.contains(target)) {
        return;
      }
      closeBookingMenu(true);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [bookingOpen]);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <button
            ref={menuTriggerRef}
            type="button"
            className="icon-button mobile-menu"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          <Link className="brand" href="/">
            <span>{brand.name}</span>
            <small>{brand.tagline.toUpperCase()}</small>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(isActive(item.href) && "nav-link--active")}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <div className="header-booking desktop-only">
              <button
                ref={bookingTriggerRef}
                type="button"
                className="header-booking__trigger"
                aria-expanded={bookingOpen}
                aria-haspopup="menu"
                aria-controls="booking-menu"
                onClick={() => setBookingOpen((open) => !open)}
              >
                Book <ChevronDown size={16} aria-hidden="true" />
              </button>
              {bookingOpen ? (
                <div ref={bookingMenuRef} id="booking-menu" className="header-booking__menu" role="menu">
                  {bookingNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="header-booking__item"
                      role="menuitem"
                      onClick={() => closeBookingMenu(false)}
                    >
                      <strong>{item.label}</strong>
                      <span>{item.description}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <button type="button" className="icon-button desktop-only" aria-label="Search">
              <Search size={21} />
            </button>
            <Link href="/account" className="icon-button desktop-only" aria-label="Account">
              <UserRound size={21} />
            </Link>
            <Link href="/cart" className="icon-button cart-button" aria-label="Cart">
              <ShoppingBag size={23} />
              <span aria-hidden="true">0</span>
            </Link>
          </div>
        </div>
      </header>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" side="left">
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("mobile-nav__link", isActive(item.href) && "nav-link--active")}
              aria-current={isActive(item.href) ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mobile-nav__group">
            <p className="mobile-nav__label">Book an experience</p>
            {bookingNav.map((item) => (
              <Link key={item.href} href={item.href} className="mobile-nav__link" onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
          <Button href="/shop" variant="primary" fullWidth onClick={() => setMenuOpen(false)}>
            Shop the collection
          </Button>
        </nav>
      </Drawer>
    </>
  );
}
