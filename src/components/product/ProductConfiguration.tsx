"use client";

import type { ConfigurationType } from "@/data/products";
import { BusinessLookup } from "@/components/product/BusinessLookup";
import { InstagramConfigField } from "@/components/product/InstagramConfigField";
import { CustomCardConfiguration } from "@/components/product/CustomCardConfiguration";
import { MultiLinkConfiguration } from "@/components/product/MultiLinkConfiguration";
import { MIN_MULTI_LINK_PLATFORMS, parseMultiLinkPlatforms } from "@/lib/multiLink";
import { isValidLogoReference } from "@/lib/multiLinkLogo";

export type ProductConfigurationValue = {
  /** Selected Google Business Profile's Place ID (finder path only — empty for manual fallback or when nothing's selected yet). */
  googlePlaceId: string;
  /** Google Business Profile name (finder path) or customer-typed business name (manual fallback). Also reused, independently, by custom-branding and multi-link below. */
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
  /** Custom-branding only — filename-only capture, unchanged (Phase 2 covers Multi-Link's logo only; see multiLinkLogo* fields below for that). */
  logoFileName: string;
  /** Multi-link only: comma-separated selected platform ids — see `src/lib/multiLink.ts`. */
  multiLinkPlatforms: string;
  facebookUrl: string;
  tiktokHandle: string;
  tripadvisorUrl: string;
  trustpilotUrl: string;
  /** Multi-link only, optional: hex colour codes for the printed card. */
  primaryColor: string;
  secondaryColor: string;
  /**
   * Multi-link only: the persisted Supabase Storage reference for the
   * required business logo, once uploaded — see `src/lib/multiLinkLogo.ts`.
   * Deliberately four flat string fields (not a nested object) to stay
   * inside this type's flat string-only shape, which is what flows into
   * cart configuration, `buildLineId`, and `order_items.configuration`.
   * All four are empty until a real upload has succeeded; never a local
   * filename or a signed/expiring URL.
   */
  multiLinkLogoBucket: string;
  multiLinkLogoPath: string;
  multiLinkLogoOriginalName: string;
  multiLinkLogoMimeType: string;
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
  multiLinkPlatforms: "",
  facebookUrl: "",
  tiktokHandle: "",
  tripadvisorUrl: "",
  trustpilotUrl: "",
  primaryColor: "",
  secondaryColor: "",
  multiLinkLogoBucket: "",
  multiLinkLogoPath: "",
  multiLinkLogoOriginalName: "",
  multiLinkLogoMimeType: "",
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
  let relevant: Record<string, string>;

  if (type === "google-business") {
    relevant = {
      googlePlaceId: value.googlePlaceId,
      businessName: value.businessName,
      businessAddress: value.businessAddress,
      googleMapsUrl: value.googleMapsUrl,
      manualDetails: value.manualDetails,
      requiresManualGoogleVerification: value.requiresManualGoogleVerification,
    };
  } else if (type === "instagram") {
    relevant = { instagramHandle: value.instagramHandle };
  } else if (type === "multi-link") {
    relevant = {
      multiLinkPlatforms: value.multiLinkPlatforms,
      googlePlaceId: value.googlePlaceId,
      businessName: value.businessName,
      businessAddress: value.businessAddress,
      googleMapsUrl: value.googleMapsUrl,
      manualDetails: value.manualDetails,
      requiresManualGoogleVerification: value.requiresManualGoogleVerification,
      instagramHandle: value.instagramHandle,
      facebookUrl: value.facebookUrl,
      tiktokHandle: value.tiktokHandle,
      tripadvisorUrl: value.tripadvisorUrl,
      trustpilotUrl: value.trustpilotUrl,
      primaryColor: value.primaryColor,
      secondaryColor: value.secondaryColor,
      multiLinkLogoBucket: value.multiLinkLogoBucket,
      multiLinkLogoPath: value.multiLinkLogoPath,
      multiLinkLogoOriginalName: value.multiLinkLogoOriginalName,
      multiLinkLogoMimeType: value.multiLinkLogoMimeType,
    };
  } else {
    relevant = {
      businessName: value.businessName,
      destination: value.destination,
      notes: value.notes,
      logoFileName: value.logoFileName,
    };
  }

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

  if (type === "multi-link") {
    const selectedPlatforms = parseMultiLinkPlatforms(value.multiLinkPlatforms);

    if (selectedPlatforms.length < MIN_MULTI_LINK_PLATFORMS) {
      errors.multiLinkPlatforms = `Select at least ${MIN_MULTI_LINK_PLATFORMS} platforms for your card.`;
    }

    if (
      !isValidLogoReference({
        bucket: value.multiLinkLogoBucket,
        path: value.multiLinkLogoPath,
        mimeType: value.multiLinkLogoMimeType,
      })
    ) {
      errors.multiLinkLogoPath = "Upload your business logo.";
    }

    if (selectedPlatforms.includes("google")) {
      const hasSelectedBusiness = value.googlePlaceId.trim() !== "" && value.businessName.trim() !== "";
      const hasManualDetails = value.businessName.trim() !== "" && value.businessAddress.trim() !== "";
      if (!hasSelectedBusiness && !hasManualDetails) {
        errors.googlePlaceId =
          "Search for your business and select it, or add your business details manually.";
      }
    }

    if (selectedPlatforms.includes("instagram") && normalizeInstagramHandle(value.instagramHandle) === "") {
      errors.instagramHandle = "Enter your Instagram username or profile URL.";
    }

    if (selectedPlatforms.includes("facebook") && value.facebookUrl.trim() === "") {
      errors.facebookUrl = "Enter your Facebook page link.";
    }

    if (selectedPlatforms.includes("tiktok") && value.tiktokHandle.trim() === "") {
      errors.tiktokHandle = "Enter your TikTok username or profile URL.";
    }

    if (selectedPlatforms.includes("tripadvisor") && value.tripadvisorUrl.trim() === "") {
      errors.tripadvisorUrl = "Enter your Tripadvisor listing link.";
    }

    if (selectedPlatforms.includes("trustpilot") && value.trustpilotUrl.trim() === "") {
      errors.trustpilotUrl = "Enter your Trustpilot profile link.";
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

type ProductConfigurationProps = {
  configurationType: ConfigurationType;
  value: ProductConfigurationValue;
  onChange: (value: ProductConfigurationValue) => void;
  errors?: ConfigurationValidationErrors;
  /** Multi-link only: fires whenever the logo upload's in-flight state changes, so the caller can disable Add to Cart while an upload/replace is in progress — see MultiLinkConfiguration. Ignored for every other configuration type. */
  onMultiLinkUploadingChange?: (isUploading: boolean) => void;
};

/** Switches between the Google/Instagram/Custom purchase-configuration UIs based on the product's `configurationType`. */
export function ProductConfiguration({
  configurationType,
  value,
  onChange,
  errors,
  onMultiLinkUploadingChange,
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

  if (configurationType === "multi-link") {
    return (
      <MultiLinkConfiguration
        value={{
          multiLinkPlatforms: value.multiLinkPlatforms,
          googlePlaceId: value.googlePlaceId,
          businessName: value.businessName,
          businessAddress: value.businessAddress,
          googleMapsUrl: value.googleMapsUrl,
          manualDetails: value.manualDetails,
          requiresManualGoogleVerification: value.requiresManualGoogleVerification,
          instagramHandle: value.instagramHandle,
          facebookUrl: value.facebookUrl,
          tiktokHandle: value.tiktokHandle,
          tripadvisorUrl: value.tripadvisorUrl,
          trustpilotUrl: value.trustpilotUrl,
          primaryColor: value.primaryColor,
          secondaryColor: value.secondaryColor,
          multiLinkLogoBucket: value.multiLinkLogoBucket,
          multiLinkLogoPath: value.multiLinkLogoPath,
          multiLinkLogoOriginalName: value.multiLinkLogoOriginalName,
          multiLinkLogoMimeType: value.multiLinkLogoMimeType,
        }}
        onChange={(next) => onChange({ ...value, ...next })}
        errors={errors}
        onUploadingChange={onMultiLinkUploadingChange}
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
