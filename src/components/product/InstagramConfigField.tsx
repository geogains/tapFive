"use client";

import { AtSign } from "lucide-react";
import { cn } from "@/lib/utils";

type InstagramConfigFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function InstagramConfigField({ value, onChange, error }: InstagramConfigFieldProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--tf-radius-lg)] border border-tf-neutral-200 p-5">
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-base font-medium tracking-tight text-tf-black">
          Your Instagram
        </h3>
        <p className="text-sm leading-relaxed text-tf-neutral-600">
          Enter your Instagram username or profile URL so we can configure your card before dispatch.
        </p>
      </div>

      <div className="relative">
        <AtSign
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tf-neutral-400"
          aria-hidden="true"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="@yourbusiness"
          aria-label="Instagram username or profile URL"
          aria-invalid={error ? true : undefined}
          className={cn(
            "tf-focus-ring w-full rounded-[var(--tf-radius-sm)] border bg-tf-white py-2.5 pl-10 pr-3.5 text-sm text-tf-black placeholder:text-tf-neutral-400",
            error ? "border-red-300" : "border-tf-neutral-200",
          )}
        />
      </div>

      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
