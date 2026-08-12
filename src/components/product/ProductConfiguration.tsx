"use client";

import type { ConfigurationType } from "@/data/products";
import { BusinessLookup } from "@/components/product/BusinessLookup";
import { InstagramConfigField } from "@/components/product/InstagramConfigField";
import { CustomCardConfiguration } from "@/components/product/CustomCardConfiguration";

export type ProductConfigurationValue = {
  /** Selected Google Business Profile's Place ID (finder path only — empty for manual fallback or when nothing's selected yet). */
  googlePlaceId: string;
  /** Google Business Profile name (finder path) or customer-typed business name (manual fallback). Also reused, independently, by custom-branding below. */
  businessName: string;
  /** Google's formatted address (finder path) or customer-typed address/postcode (manual fallback). */
  businessAddress: string;
  /** Manual fallback only: optional Google Maps share URL the customer may supply to help identify their listing. */
  googleMapsUrl: string;
  /** Manual fallback only: freeform "anything else that helps" notes. */
  manualDetails: string;
  /** `"true"` | `"false"` — string, not boolean, to match the flat string-only shape this value flows into (cart configuration, order_items.configuration). Re-derived server-side too; see orderConfiguration.ts. */
  requiresManualGoogleVerification: string;
  instagramHandle: string;
  destination: string;
  notes: string;
  logoFileName: string;
};

export const emptyProductConfiguration: ProductConfigurationValue = {
  googlePlaceId: "",
  businessName: "",
  businessAddress: "",
  googleMapsUrl: "",
  manualDetails: "",
  requiresManualGoogleVerification: "",
  instagramHandle: "",
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
      ? {
          googlePlaceId: value.googlePlaceId,
          businessName: value.businessName,
          businessAddress: value.businessAddress,
          googleMapsUrl: value.googleMapsUrl,
          manualDetails: value.manualDetails,
          requiresManualGoogleVerification: value.requiresManualGoogleVerification,
        }
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
    // Finder path: a real selected business (Place ID + name). Manual
    // fallback path: enough for Tap Five to identify the business later
    // (name + address). Either satisfies the requirement.
    const hasSelectedBusiness = value.googlePlaceId.trim() !== "" && value.businessName.trim() !== "";
    const hasManualDetails = value.businessName.trim() !== "" && value.businessAddress.trim() !== "";
    if (!hasSelectedBusiness && !hasManualDetails) {
      errors.googlePlaceId =
        "Search for your business and select it, or add your business details manually, so we know which page to configure.";
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
        value={{
          googlePlaceId: value.googlePlaceId,
          businessName: value.businessName,
          businessAddress: value.businessAddress,
          googleMapsUrl: value.googleMapsUrl,
          manualDetails: value.manualDetails,
          requiresManualGoogleVerification: value.requiresManualGoogleVerification,
        }}
        onChange={(next) => onChange({ ...value, ...next })}
        error={errors?.googlePlaceId}
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
