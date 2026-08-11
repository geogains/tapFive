"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

const fieldClasses =
  "tf-focus-ring w-full rounded-[var(--tf-radius-sm)] border border-tf-neutral-300 bg-tf-white px-4 py-3 text-sm text-tf-black placeholder:text-tf-neutral-400 transition-colors focus:border-tf-accent disabled:opacity-60";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSubmitting = status === "submitting";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          business: data.get("business"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
          // Honeypot — see the hidden field below.
          website: data.get("website"),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        setErrorMessage(result?.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("success");
    } catch {
      setErrorMessage("Something went wrong. Please check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-[var(--tf-radius-md)] border border-tf-accent/30 bg-tf-accent-soft p-6 text-sm text-tf-black"
      >
        Thanks — your message has been sent. We&apos;ll get back to you as soon as we can.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/*
        Honeypot: hidden from real users (off-screen, not display:none —
        some bots skip fields hidden that way — and unreachable by
        keyboard/screen reader), but a form-filling bot that doesn't
        render CSS will typically still find and fill it. Any value here
        server-side means the submission is silently dropped.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Leave this field blank</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="name" label="Name" autoComplete="name" required maxLength={200} disabled={isSubmitting} />
        <Field id="business" label="Business name" autoComplete="organization" maxLength={200} disabled={isSubmitting} />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="email" label="Email" type="email" autoComplete="email" required maxLength={320} disabled={isSubmitting} />
        <Field id="phone" label="Phone" type="tel" autoComplete="tel" maxLength={50} disabled={isSubmitting} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-medium text-tf-black">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          maxLength={5000}
          disabled={isSubmitting}
          className={fieldClasses}
          placeholder="Tell us a little about your business and what you're looking for."
        />
      </div>

      {status === "error" && errorMessage ? (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      ) : null}

      <p className="text-xs leading-relaxed text-tf-neutral-500">
        By submitting this form, you agree that Tap Five may use the information you provide to respond to your
        enquiry. See our{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-tf-black">
          Privacy Policy
        </a>
        .
      </p>

      <Button type="submit" size="lg" className="self-start" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  type = "text",
  autoComplete,
  required,
  maxLength,
  disabled,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-tf-black">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        maxLength={maxLength}
        disabled={disabled}
        className={fieldClasses}
      />
    </div>
  );
}
