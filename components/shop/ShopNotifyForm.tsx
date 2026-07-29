"use client";

import { FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "hod-shop-notify-email";

export function ShopNotifyForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const value = email.trim().toLowerCase();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }

    startTransition(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, value);
      } catch {
        // Private mode / quota — still show success for UX.
      }
      setSuccess(true);
      setEmail("");
    });
  }

  if (success) {
    return (
      <p className="shop-soon__notify-success" role="status">
        You&apos;re on the list. We&apos;ll be in touch when the collection launches.
      </p>
    );
  }

  return (
    <form className="shop-soon__form" onSubmit={onSubmit} noValidate>
      <label className="visually-hidden" htmlFor="shop-notify-email">
        Email address
      </label>
      <input
        id="shop-notify-email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "shop-notify-error" : undefined}
      />
      <Button type="submit" variant="primary" loading={pending}>
        Notify Me
      </Button>
      {error ? (
        <p id="shop-notify-error" className="shop-soon__form-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
