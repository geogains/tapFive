"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

const fieldClasses =
  "tf-focus-ring w-full rounded-[var(--tf-radius-sm)] border border-tf-neutral-300 bg-tf-white px-4 py-3 text-sm text-tf-black placeholder:text-tf-neutral-400 transition-colors focus:border-tf-accent";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    /**
     * Future integration point: wire this up to a real backend
     * (e.g. an API route, form service, or CRM) to actually send
     * this enquiry. Currently this form is presentational only and
     * does not transmit any data.
     */
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-[var(--tf-radius-md)] border border-tf-accent/30 bg-tf-accent-soft p-6 text-sm text-tf-black"
      >
        Thanks — this is a template confirmation message. Once connected to a backend,
        a real enquiry would be sent to Tap Five here.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="name" label="Name" autoComplete="name" required />
        <Field id="business" label="Business name" autoComplete="organization" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="email" label="Email" type="email" autoComplete="email" required />
        <Field id="phone" label="Phone" type="tel" autoComplete="tel" />
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
          className={fieldClasses}
          placeholder="Tell us a little about your business and what you're looking for."
        />
      </div>

      <Button type="submit" size="lg" className="self-start">
        Send message
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
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
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
        className={fieldClasses}
      />
    </div>
  );
}
