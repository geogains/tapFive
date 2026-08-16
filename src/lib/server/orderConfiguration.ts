import type { ConfigurationType } from "@/data/products";
import { buildGoogleReviewUrl } from "@/lib/googleReview";
import { MIN_MULTI_LINK_PLATFORMS, parseMultiLinkPlatforms } from "@/lib/multiLink";
import { isValidLogoReference } from "@/lib/multiLinkLogo";

/**
 * Server-side allow-list of configuration fields per product configuration
 * type. This is the source of truth for "what are we willing to trust as
 * order data" — any key not listed here is dropped, regardless of what a
 * client submits. Keep in sync with `ProductConfigurationValue` in
 * `src/components/product/ProductConfiguration.tsx` (the client-side shape)
 * if that ever changes.
 *
 * Deliberately does NOT include `googleReviewUrl` — that key is never
 * accepted from the client under any name; it's the one field this module
 * computes itself (see below) from a validated `googlePlaceId`, so a
 * client-submitted value for it is silently dropped by the allow-list
 * before validation even runs, then unconditionally overwritten with the
 * server-derived one on the success path.
 */
export const ALLOWED_CONFIGURATION_FIELDS: Record<ConfigurationType, readonly string[]> = {
  "google-business": [
    "googlePlaceId",
    "businessName",
    "businessAddress",
    "googleMapsUrl",
    "manualDetails",
    "requiresManualGoogleVerification",
  ],
  instagram: ["instagramHandle"],
  "custom-branding": ["businessName", "destination", "notes", "logoFileName"],
  "multi-link": [
    "multiLinkPlatforms",
    "googlePlaceId",
    "businessName",
    "businessAddress",
    "googleMapsUrl",
    "manualDetails",
    "requiresManualGoogleVerification",
    "instagramHandle",
    "facebookUrl",
    "tiktokHandle",
    "tripadvisorUrl",
    "trustpilotUrl",
    "primaryColor",
    "secondaryColor",
    "multiLinkLogoBucket",
    "multiLinkLogoPath",
    "multiLinkLogoOriginalName",
    "multiLinkLogoMimeType",
  ],
};

const MAX_FIELD_LENGTH = 500;

/**
 * Light structural sanity check only — genuine Google Place IDs are an
 * opaque, URL-safe identifier (letters, digits, `-`, `_`), typically well
 * under 200 characters. Deliberately not a tight-format regex (e.g.
 * requiring a "ChIJ" prefix): Place ID shapes vary and are not part of any
 * public contract Tap Five should assume or enforce. This exists only to
 * reject obviously-bogus/injected input, never to second-guess a real ID.
 */
const PLACE_ID_PATTERN = /^[A-Za-z0-9_-]{10,255}$/;

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

  if (type === "google-business") {
    // Finder path: a real selected business (Place ID + name). Manual
    // fallback path: enough for Tap Five to identify the business later
    // (name + address) — never a fabricated Place ID.
    const hasSelectedBusiness = Boolean(sanitized.googlePlaceId && sanitized.businessName);
    const hasManualDetails = Boolean(sanitized.businessName && sanitized.businessAddress);

    if (!hasSelectedBusiness && !hasManualDetails) {
      return {
        valid: false,
        message:
          "Business information is required for a Google Review Card — search for your business, or add details manually.",
      };
    }

    if (sanitized.googlePlaceId && !PLACE_ID_PATTERN.test(sanitized.googlePlaceId)) {
      return {
        valid: false,
        message: "That doesn't look like a valid Google business selection — please search again.",
      };
    }

    if (hasSelectedBusiness) {
      // Trusted finder path. `googleReviewUrl` is computed here, from the
      // just-validated `googlePlaceId` — never accepted from the client
      // (the allow-list above drops any client-submitted `googleReviewUrl`
      // before this point is ever reached), so nothing the browser sends
      // can override this. Bounded in length by `PLACE_ID_PATTERN` above,
      // well under `MAX_FIELD_LENGTH`.
      sanitized.googleReviewUrl = buildGoogleReviewUrl(sanitized.googlePlaceId);
      sanitized.requiresManualGoogleVerification = "false";
    } else {
      // Manual fallback — re-derive the flag server-side rather than trust
      // whatever the client sent for it; never set a review URL here.
      sanitized.requiresManualGoogleVerification = "true";
    }
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

  if (type === "multi-link") {
    const selectedPlatforms = parseMultiLinkPlatforms(sanitized.multiLinkPlatforms ?? "");

    if (selectedPlatforms.length < MIN_MULTI_LINK_PLATFORMS) {
      return {
        valid: false,
        message: `Select at least ${MIN_MULTI_LINK_PLATFORMS} platforms for a Multi-Link Card.`,
      };
    }

    // Never trusts the client's shape alone — confirms the bucket is
    // exactly the known constant (never client-chosen), the path matches
    // the strict server-generated-path pattern (no traversal, no arbitrary
    // strings), and the mime type is one of the allowed set and actually
    // agrees with the path's extension. This does NOT confirm the object
    // still exists in Storage (no round-trip to Supabase from here) — see
    // multiLinkLogo.ts for why that's a deliberate, documented tradeoff.
    if (
      !isValidLogoReference({
        bucket: sanitized.multiLinkLogoBucket,
        path: sanitized.multiLinkLogoPath,
        mimeType: sanitized.multiLinkLogoMimeType,
      })
    ) {
      return { valid: false, message: "A valid business logo upload is required for a Multi-Link Card." };
    }

    if (selectedPlatforms.includes("google")) {
      const hasSelectedBusiness = Boolean(sanitized.googlePlaceId && sanitized.businessName);
      const hasManualDetails = Boolean(sanitized.businessName && sanitized.businessAddress);

      if (!hasSelectedBusiness && !hasManualDetails) {
        return {
          valid: false,
          message:
            "Google business information is required for the platforms you selected — search for your business, or add details manually.",
        };
      }

      if (sanitized.googlePlaceId && !PLACE_ID_PATTERN.test(sanitized.googlePlaceId)) {
        return {
          valid: false,
          message: "That doesn't look like a valid Google business selection — please search again.",
        };
      }

      if (hasSelectedBusiness) {
        // Same derivation as the "google-business" branch above — never
        // trusted from the client (dropped by the allow-list before this
        // point), always recomputed from the just-validated Place ID.
        sanitized.googleReviewUrl = buildGoogleReviewUrl(sanitized.googlePlaceId);
        sanitized.requiresManualGoogleVerification = "false";
      } else {
        sanitized.requiresManualGoogleVerification = "true";
      }
    }

    if (selectedPlatforms.includes("instagram") && !sanitized.instagramHandle) {
      return {
        valid: false,
        message: "An Instagram link is required for the platforms you selected.",
      };
    }

    if (selectedPlatforms.includes("facebook") && !sanitized.facebookUrl) {
      return { valid: false, message: "A Facebook link is required for the platforms you selected." };
    }

    if (selectedPlatforms.includes("tiktok") && !sanitized.tiktokHandle) {
      return { valid: false, message: "A TikTok link is required for the platforms you selected." };
    }

    if (selectedPlatforms.includes("tripadvisor") && !sanitized.tripadvisorUrl) {
      return { valid: false, message: "A Tripadvisor link is required for the platforms you selected." };
    }

    if (selectedPlatforms.includes("trustpilot") && !sanitized.trustpilotUrl) {
      return { valid: false, message: "A Trustpilot link is required for the platforms you selected." };
    }
  }

  return { valid: true, configuration: sanitized };
}
