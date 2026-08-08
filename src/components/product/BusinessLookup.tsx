"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export type BusinessLookupValue = {
  businessQuery: string;
  manualDetails: string;
};

type BusinessLookupProps = {
  value: BusinessLookupValue;
  onChange: (value: BusinessLookupValue) => void;
};

/**
 * First-pass UI placeholder for Google Business lookup.
 *
 * TODO(google-places): wire this up to the Google Places Autocomplete API.
 * This component intentionally does NOT call any Google endpoint, does NOT
 * fabricate search results, and does NOT generate a Place ID — it only
 * captures free text for now. When the real integration lands:
 *   - replace the plain text input below with a Places Autocomplete widget
 *   - store the selected `place_id` (not just the typed string) alongside
 *     `businessQuery` so the order can be matched to the right listing
 *   - keep the "Can't find your business?" manual fallback for edge cases
 */
export function BusinessLookup({ value, onChange }: BusinessLookupProps) {
  const [showManualEntry, setShowManualEntry] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-[var(--tf-radius-lg)] border border-tf-neutral-200 p-5">
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-base font-medium tracking-tight text-tf-black">
          Find your business
        </h3>
        <p className="text-sm leading-relaxed text-tf-neutral-600">
          Search for your Google Business Profile so we can configure your card before it arrives.
        </p>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tf-neutral-400"
          aria-hidden="true"
        />
        <input
          type="text"
          value={value.businessQuery}
          onChange={(event) => onChange({ ...value, businessQuery: event.target.value })}
          placeholder="Start typing your business name…"
          aria-label="Search for your business"
          className="tf-focus-ring w-full rounded-[var(--tf-radius-sm)] border border-tf-neutral-200 bg-tf-white py-2.5 pl-10 pr-3.5 text-sm text-tf-black placeholder:text-tf-neutral-400"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowManualEntry((current) => !current)}
        aria-expanded={showManualEntry}
        className="tf-focus-ring self-start text-xs font-medium text-tf-neutral-500 underline-offset-2 hover:text-tf-black hover:underline"
      >
        Can&apos;t find your business?
      </button>

      {showManualEntry ? (
        <div className="flex flex-col gap-2 rounded-[var(--tf-radius-sm)] bg-tf-neutral-100 p-4">
          <p className="text-xs leading-relaxed text-tf-neutral-600">
            No problem — add your business details below and our team will confirm the right review
            link with you directly.
          </p>
          <textarea
            value={value.manualDetails}
            onChange={(event) => onChange({ ...value, manualDetails: event.target.value })}
            placeholder="Business name, address, and any other details that will help us find your listing…"
            rows={3}
            className="tf-focus-ring w-full resize-none rounded-[var(--tf-radius-sm)] border border-tf-neutral-200 bg-tf-white p-3 text-sm text-tf-black placeholder:text-tf-neutral-400"
          />
        </div>
      ) : null}
    </div>
  );
}
