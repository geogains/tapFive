"use client";

import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export type CustomCardConfigValue = {
  businessName: string;
  destination: string;
  notes: string;
  logoFileName: string;
};

export type CustomCardConfigErrors = {
  businessName?: string;
  destination?: string;
};

type CustomCardConfigurationProps = {
  value: CustomCardConfigValue;
  onChange: (value: CustomCardConfigValue) => void;
  errors?: CustomCardConfigErrors;
};

/**
 * TODO(uploads): this project has no backend/API route yet (checked
 * `src/app` — pages only, no `route.ts` handlers), so a real file upload has
 * nowhere to persist to. The logo field below only captures the selected
 * file's name for now; it does not upload or store the file anywhere. Wire
 * this up to real storage (and stop relying on the client-side filename)
 * before this goes live.
 */
export function CustomCardConfiguration({ value, onChange, errors }: CustomCardConfigurationProps) {
  return (
    <div className="flex flex-col gap-5 rounded-[var(--tf-radius-lg)] border border-tf-neutral-200 p-5">
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-base font-medium tracking-tight text-tf-black">
          Customise your card
        </h3>
        <p className="text-sm leading-relaxed text-tf-neutral-600">
          After ordering, we&apos;ll prepare your branded design and configure the card before dispatch.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="custom-business-name" className="text-xs font-medium text-tf-neutral-600">
          Business name
        </label>
        <input
          id="custom-business-name"
          type="text"
          value={value.businessName}
          onChange={(event) => onChange({ ...value, businessName: event.target.value })}
          placeholder="Your business name"
          aria-invalid={errors?.businessName ? true : undefined}
          className={cn(
            "tf-focus-ring w-full rounded-[var(--tf-radius-sm)] border bg-tf-white px-3.5 py-2.5 text-sm text-tf-black placeholder:text-tf-neutral-400",
            errors?.businessName ? "border-red-300" : "border-tf-neutral-200",
          )}
        />
        {errors?.businessName ? (
          <p className="text-xs font-medium text-red-600">{errors.businessName}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="custom-logo" className="text-xs font-medium text-tf-neutral-600">
          Logo upload
        </label>
        <label
          htmlFor="custom-logo"
          className="tf-focus-ring flex cursor-pointer items-center gap-3 rounded-[var(--tf-radius-sm)] border border-dashed border-tf-neutral-300 px-3.5 py-3 text-sm text-tf-neutral-600 transition-colors hover:border-tf-neutral-400"
        >
          <Upload className="h-4 w-4 shrink-0 text-tf-neutral-400" aria-hidden="true" />
          <span className="truncate">{value.logoFileName || "Choose a file…"}</span>
        </label>
        <input
          id="custom-logo"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) =>
            onChange({ ...value, logoFileName: event.target.files?.[0]?.name ?? "" })
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="custom-destination" className="text-xs font-medium text-tf-neutral-600">
          Destination / link
        </label>
        <input
          id="custom-destination"
          type="text"
          value={value.destination}
          onChange={(event) => onChange({ ...value, destination: event.target.value })}
          placeholder="Where should customers be sent when they tap or scan?"
          aria-invalid={errors?.destination ? true : undefined}
          className={cn(
            "tf-focus-ring w-full rounded-[var(--tf-radius-sm)] border bg-tf-white px-3.5 py-2.5 text-sm text-tf-black placeholder:text-tf-neutral-400",
            errors?.destination ? "border-red-300" : "border-tf-neutral-200",
          )}
        />
        {errors?.destination ? (
          <p className="text-xs font-medium text-red-600">{errors.destination}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="custom-notes" className="text-xs font-medium text-tf-neutral-600">
          Optional notes
        </label>
        <textarea
          id="custom-notes"
          value={value.notes}
          onChange={(event) => onChange({ ...value, notes: event.target.value })}
          placeholder="Brand colours, layout preferences, or anything else we should know"
          rows={3}
          className="tf-focus-ring w-full resize-none rounded-[var(--tf-radius-sm)] border border-tf-neutral-200 bg-tf-white p-3 text-sm text-tf-black placeholder:text-tf-neutral-400"
        />
      </div>
    </div>
  );
}
