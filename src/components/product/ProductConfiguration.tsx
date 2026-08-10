"use client";

import type { ConfigurationType } from "@/data/products";
import { BusinessLookup } from "@/components/product/BusinessLookup";
import { InstagramConfigField } from "@/components/product/InstagramConfigField";
import { CustomCardConfiguration } from "@/components/product/CustomCardConfiguration";

export type ProductConfigurationValue = {
  businessQuery: string;
  manualDetails: string;
  instagramHandle: string;
  businessName: string;
  destination: string;
  notes: string;
  logoFileName: string;
};

export const emptyProductConfiguration: ProductConfigurationValue = {
  businessQuery: "",
  manualDetails: "",
  instagramHandle: "",
  businessName: "",
  destination: "",
  notes: "",
  logoFileName: "",
};

/**
 * Reduces the full configuration value down to just the fields relevant to
 * the given configuration type, dropping empty ones. This is what gets
 * attached to the cart line as metadata, and is now shown in the cart UI
 * (see `CartItemConfiguration`).
 *
 * This is still only a client-side capture — `validateProductConfiguration`
 * below gives instant UI feedback, but it is NOT the security boundary.
 * The future checkout/order API must independently re-validate via
 * `validateOrderConfiguration` in `src/lib/server/orderConfiguration.ts`
 * rather than trusting that either of these ran.
 */
export function toCartConfiguration(
  type: ConfigurationType,
  value: ProductConfigurationValue,
): Record<string, string> | undefined {
  const relevant: Record<string, string> =
    type === "google-business"
      ? { businessQuery: value.businessQuery, manualDetails: value.manualDetails }
      : type === "instagram"
        ? { instagramHandle: value.instagramHandle }
        : {
            businessName: value.businessName,
            destination: value.destination,
            notes: value.notes,
            logoFileName: value.logoFileName,
          };

  const nonEmpty = Object.fromEntries(Object.entries(relevant).filter(([, v]) => v.trim() !== ""));
  return Object.keys(nonEmpty).length > 0 ? nonEmpty : undefined;
}

export type ConfigurationValidationErrors = Partial<Record<keyof ProductConfigurationValue, string>>;

/**
 * Light formatting only — trims whitespace and ensures a leading "@" unless
 * the customer pasted a full profile URL. Never invents or guesses a
 * handle; an empty input stays empty (validation, not normalisation,
 * handles that case).
 */
export function normalizeInstagramHandle(input: string): string {
  const trimmed = input.trim();
  if (trimmed === "" || /^https?:\/\//i.test(trimmed)) return trimmed;
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

/**
 * Client-side check run just before Add to Cart, purely for instant inline
 * feedback. Mirrors the *requirements* enforced again (independently) by
 * `validateOrderConfiguration` server-side — if these rules ever change,
 * update both, since the server copy intentionally does not import this
 * one.
 */
export function validateProductConfiguration(
  type: ConfigurationType,
  value: ProductConfigurationValue,
): { valid: boolean; errors: ConfigurationValidationErrors } {
  const errors: ConfigurationValidationErrors = {};

  if (type === "google-business") {
    if (value.businessQuery.trim() === "" && value.manualDetails.trim() === "") {
      errors.businessQuery =
        "Search for your business, or add details manually, so we know which page to configure.";
    }
  }

  if (type === "instagram") {
    if (normalizeInstagramHandle(value.instagramHandle) === "") {
      errors.instagramHandle = "Enter your Instagram username or profile URL.";
    }
  }

  if (type === "custom-branding") {
    if (value.businessName.trim() === "") {
      errors.businessName = "Enter your business name.";
    }
    if (value.destination.trim() === "") {
      errors.destination = "Enter where customers should be sent.";
    }
    // Notes stay optional deliberately, and the logo field only ever
    // captures a filename today (see CustomCardConfiguration) — neither is
    // required here.
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

type ProductConfigurationProps = {
  configurationType: ConfigurationType;
  value: ProductConfigurationValue;
  onChange: (value: ProductConfigurationValue) => void;
  errors?: ConfigurationValidationErrors;
};

/** Switches between the Google/Instagram/Custom purchase-configuration UIs based on the product's `configurationType`. */
export function ProductConfiguration({
  configurationType,
  value,
  onChange,
  errors,
}: ProductConfigurationProps) {
  if (configurationType === "google-business") {
    return (
      <BusinessLookup
        value={{ businessQuery: value.businessQuery, manualDetails: value.manualDetails }}
        onChange={(next) => onChange({ ...value, ...next })}
        error={errors?.businessQuery}
      />
    );
  }

  if (configurationType === "instagram") {
    return (
      <InstagramConfigField
        value={value.instagramHandle}
        onChange={(instagramHandle) => onChange({ ...value, instagramHandle })}
        error={errors?.instagramHandle}
      />
    );
  }

  return (
    <CustomCardConfiguration
      value={{
        businessName: value.businessName,
        destination: value.destination,
        notes: value.notes,
        logoFileName: value.logoFileName,
      }}
      onChange={(next) => onChange({ ...value, ...next })}
      errors={{ businessName: errors?.businessName, destination: errors?.destination }}
    />
  );
}
