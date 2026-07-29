"use client";

import { FormEvent, useState, useTransition } from "react";
import { submitContactAction } from "@/app/contact/actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form/FormField";
import { TextArea } from "@/components/ui/form/TextArea";
import { TextInput } from "@/components/ui/form/TextInput";

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      const result = await submitContactAction(data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
      form.reset();
    });
  }

  if (sent) {
    return (
      <div className="lux-contact__success" role="status">
        <h3>Message received</h3>
        <p>
          Thank you for reaching out. We&apos;ll review your note and respond with care
          shortly.
        </p>
        <Button type="button" variant="outline" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form className="lux-contact__form" aria-label="Contact form" onSubmit={onSubmit} noValidate>
      {/* Honeypot — leave empty */}
      <input
        type="text"
        name="companyWebsite"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", height: 0, width: 0, opacity: 0 }}
      />
      <FormField id="contact-name" label="Name" required>
        <TextInput id="contact-name" name="name" autoComplete="name" required />
      </FormField>
      <FormField
        id="contact-email"
        label="Email"
        required
        hint="We'll only use this to respond to your message."
      >
        <TextInput
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </FormField>
      <FormField id="contact-message" label="Message" required>
        <TextArea id="contact-message" name="message" rows={6} required />
      </FormField>
      {error ? (
        <p className="lux-contact__error" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="primary" fullWidth loading={pending}>
        Send message
      </Button>
    </form>
  );
}
