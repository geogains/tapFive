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
 * attached to the cart line as metadata.
 *
 * TODO: this metadata is not yet surfaced in the cart UI (see
 * `CartProvider`) and is not validated server-side — treat it as a draft
 * capture only until checkout is connected.
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

type ProductConfigurationProps = {
  configurationType: ConfigurationType;
  value: ProductConfigurationValue;
  onChange: (value: ProductConfigurationValue) => void;
};

/** Switches between the Google/Instagram/Custom purchase-configuration UIs based on the product's `configurationType`. */
export function ProductConfiguration({ configurationType, value, onChange }: ProductConfigurationProps) {
  if (configurationType === "google-business") {
    return (
      <BusinessLookup
        value={{ businessQuery: value.businessQuery, manualDetails: value.manualDetails }}
        onChange={(next) => onChange({ ...value, ...next })}
      />
    );
  }

  if (configurationType === "instagram") {
    return (
      <InstagramConfigField
        value={value.instagramHandle}
        onChange={(instagramHandle) => onChange({ ...value, instagramHandle })}
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
    />
  );
}
