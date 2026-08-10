import type { ConfigurationType } from "@/data/products";

/**
 * Server-side allow-list of configuration fields per product configuration
 * type. This is the source of truth for "what are we willing to trust as
 * order data" — any key not listed here is dropped, regardless of what a
 * client submits. Keep in sync with `ProductConfigurationValue` in
 * `src/components/product/ProductConfiguration.tsx` (the client-side shape)
 * if that ever changes.
 */
export const ALLOWED_CONFIGURATION_FIELDS: Record<ConfigurationType, readonly string[]> = {
  "google-business": ["businessQuery", "manualDetails"],
  instagram: ["instagramHandle"],
  "custom-branding": ["businessName", "destination", "notes", "logoFileName"],
};

const MAX_FIELD_LENGTH = 500;

export type ConfigurationValidationResult =
  | { valid: true; configuration: Record<string, string> }
  | { valid: false; message: string };

/**
 * Independent server-side re-check of a cart line's configuration.
 *
 * Not wired to any route yet — this is what the future checkout/order API
 * must call before persisting an order, instead of trusting that the
 * client's own validation (`validateProductConfiguration` in
 * `ProductConfiguration.tsx`) actually ran. That client check exists purely
 * for instant UI feedback and is not a security boundary; a request built
 * by hand (bypassing the browser entirely) must still be rejected here if
 * it doesn't satisfy these rules.
 *
 * Behaviour:
 *  - drops any key not in `ALLOWED_CONFIGURATION_FIELDS` for this product
 *    type — arbitrary client-submitted keys never become trusted order data
 *  - drops non-string values and empty/whitespace-only strings
 *  - rejects (rather than silently truncates) any value over
 *    `MAX_FIELD_LENGTH` characters
 *  - re-applies the same "is this product's configuration actually
 *    complete" rules as the client validator
 */
export function validateOrderConfiguration(
  type: ConfigurationType,
  rawConfiguration: Record<string, string> | undefined | null,
): ConfigurationValidationResult {
  const allowedKeys = ALLOWED_CONFIGURATION_FIELDS[type];
  const input = rawConfiguration ?? {};

  const sanitized: Record<string, string> = {};
  for (const key of allowedKeys) {
    const value = input[key];
    if (typeof value !== "string") continue;

    const trimmed = value.trim();
    if (trimmed === "") continue;

    if (trimmed.length > MAX_FIELD_LENGTH) {
      return {
        valid: false,
        message: `"${key}" is longer than the ${MAX_FIELD_LENGTH} character limit.`,
      };
    }

    sanitized[key] = trimmed;
  }

  if (type === "google-business" && !sanitized.businessQuery && !sanitized.manualDetails) {
    return { valid: false, message: "Business information is required for a Google Review Card." };
  }

  if (type === "instagram" && !sanitized.instagramHandle) {
    return { valid: false, message: "An Instagram handle is required for an Instagram Follow Card." };
  }

  if (type === "custom-branding" && (!sanitized.businessName || !sanitized.destination)) {
    return {
      valid: false,
      message: "Business name and destination are required for a Custom Branded Card.",
    };
  }

  return { valid: true, configuration: sanitized };
}
