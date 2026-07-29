"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { brand } from "@/data/brand";
import { bookingNav, primaryNav } from "@/data/navigation";
import { CartCount } from "@/components/commerce/CartCount";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuTriggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header className={cn("lux-header", scrolled && "lux-header--scrolled")}>
        <div className="lux-header__inner">
          <button
            ref={menuTriggerRef}
            type="button"
            className="lux-header__icon lux-header__menu-trigger"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} strokeWidth={1.75} aria-hidden="true" />
          </button>

          <Link className="lux-header__brand" href="/">
            <span className="lux-header__brand-mark" aria-hidden="true">
              <Image
                src="/images/house-of-denise/hd-crest-light.png"
                alt=""
                width={64}
                height={36}
                className="lux-header__brand-mark-img"
                priority
              />
            </span>
            <span className="lux-header__brand-text">
              <span className="lux-header__brand-name">{brand.name}</span>
              <small className="lux-header__brand-tagline">
                FRAGRANCE · SELF-CARE · EXPERIENCES
              </small>
            </span>
          </Link>

          <nav className="lux-header__nav" aria-label="Primary navigation">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "lux-header__nav-link",
                  isActive(item.href) && "lux-header__nav-link--active"
                )}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="lux-header__actions">
            <Button
              href="/booking"
              variant="gold"
              size="sm"
              className="lux-header__book desktop-only"
            >
              Book Experience
            </Button>
            <Link
              href="/account"
              className="lux-header__icon desktop-only"
              aria-label="Account"
            >
              <UserRound size={20} strokeWidth={1.75} aria-hidden="true" />
            </Link>
            <Link href="/cart" className="lux-header__icon lux-header__cart" aria-label="Cart">
              <ShoppingBag size={21} strokeWidth={1.75} aria-hidden="true" />
              <CartCount />
            </Link>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="lux-drawer lux-drawer--open">
          <button
            type="button"
            className="lux-drawer__backdrop"
            aria-label="Close menu"
            onClick={() => {
              setMenuOpen(false);
              menuTriggerRef.current?.focus();
            }}
          />
          <aside
            id="mobile-navigation"
            className="lux-drawer__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="lux-drawer__top">
              <p className="lux-drawer__brand">{brand.name}</p>
              <button
                ref={closeButtonRef}
                type="button"
                className="lux-header__icon"
                aria-label="Close menu"
                onClick={() => {
                  setMenuOpen(false);
                  menuTriggerRef.current?.focus();
                }}
              >
                <X size={22} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>

            <nav className="lux-drawer__nav" aria-label="Mobile navigation">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "lux-drawer__link",
                    isActive(item.href) && "lux-drawer__link--active"
                  )}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="lux-drawer__group">
                <p className="lux-drawer__label">Book an experience</p>
                {bookingNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="lux-drawer__sublink"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="lux-drawer__cta">
              <Button href="/booking" variant="gold" fullWidth onClick={() => setMenuOpen(false)}>
                Book Experience
              </Button>
              <Button href="/shop" variant="outline" fullWidth onClick={() => setMenuOpen(false)}>
                Shop the collection
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
