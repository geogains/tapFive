import { parseMultiLinkPlatforms, multiLinkPlatformLabel } from "@/lib/multiLink";

const CONFIGURATION_FIELD_LABELS: Record<string, string> = {
  manualDetails: "Business details",
  instagramHandle: "Instagram",
  businessName: "Business",
  businessAddress: "Business address",
  googleMapsUrl: "Google Maps link",
  destination: "Destination",
  notes: "Notes",
  logoFileName: "Logo",
  multiLinkPlatforms: "Platforms",
  facebookUrl: "Facebook",
  tiktokHandle: "TikTok",
  tripadvisorUrl: "Tripadvisor",
  trustpilotUrl: "Trustpilot",
  primaryColor: "Primary colour",
  secondaryColor: "Secondary colour",
  multiLinkLogoOriginalName: "Business logo",
};

// Keys never shown as their own raw dt/dd row: the Place ID is an internal
// identifier (never shown to the customer, per the Google Business finder's
// own rule), the manual-verification flag is an internal bookkeeping value,
// and the logo's Storage bucket/path/mime type are internal references, not
// something a customer typed or should see — `multiLinkLogoOriginalName`
// (the friendly filename) is what's shown instead, via the label above.
const NEVER_DISPLAY_KEYS = new Set([
  "googlePlaceId",
  "requiresManualGoogleVerification",
  "multiLinkLogoBucket",
  "multiLinkLogoPath",
  "multiLinkLogoMimeType",
]);

// Google Business configuration keys never shown as their own raw dt/dd
// row — `businessAddress`/`googlePlaceId` only ever appear together with
// `businessName` for a google-business line (see ALLOWED_CONFIGURATION_FIELDS
// in orderConfiguration.ts), so their presence is what identifies this as a
// Google Business line without needing configurationType threaded down
// through CartLineItem/CartDrawer/CartPageContent just for this. Excluded
// for a multi-link line (identified by `multiLinkPlatforms`), since there
// Google is only one of several selected platforms and the generic
// per-field rendering below should show all of them, not just Google's.
const GOOGLE_BUSINESS_ONLY_KEYS = new Set([
  "googlePlaceId",
  "businessAddress",
  "googleMapsUrl",
  "requiresManualGoogleVerification",
]);

/**
 * Concise, human-readable summary of a cart line's captured configuration
 * (Instagram handle, Google business details, custom branding info, etc.)
 * so a customer can spot a typo before paying. Shared by the cart drawer
 * and the /cart page via `CartLineItem`. Renders nothing if there's no
 * configuration, or every field on it is empty — never dumps raw JSON, and
 * — for a Google Business selection — never shows the raw Place ID itself.
 */
export function CartItemConfiguration({ configuration }: { configuration?: Record<string, string> }) {
  if (!configuration) return null;

  const entries = Object.entries(configuration).filter(([, value]) => value.trim() !== "");
  if (entries.length === 0) return null;

  const isMultiLink = Boolean(configuration.multiLinkPlatforms?.trim());
  const isGoogleBusiness = !isMultiLink && entries.some(([key]) => GOOGLE_BUSINESS_ONLY_KEYS.has(key));
  if (isGoogleBusiness) {
    const name = configuration.businessName?.trim();
    if (!name) return null;
    const address = configuration.businessAddress?.trim();
    const pending = configuration.requiresManualGoogleVerification === "true";

    return (
      <dl className="flex flex-col gap-1.5 rounded-[var(--tf-radius-sm)] bg-tf-neutral-100 px-3 py-2.5">
        <div className="flex flex-col">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-tf-neutral-500">
            Google Business
          </dt>
          <dd className="line-clamp-2 text-xs text-tf-neutral-700">
            {address ? `${name} — ${address}` : name}
            {pending ? " · pending verification" : ""}
          </dd>
        </div>
      </dl>
    );
  }

  const displayEntries = entries.filter(([key]) => !NEVER_DISPLAY_KEYS.has(key));
  if (displayEntries.length === 0) return null;

  return (
    <dl className="flex flex-col gap-1.5 rounded-[var(--tf-radius-sm)] bg-tf-neutral-100 px-3 py-2.5">
      {displayEntries.map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-tf-neutral-500">
            {CONFIGURATION_FIELD_LABELS[key] ?? key}
          </dt>
          <dd className="line-clamp-2 text-xs text-tf-neutral-700">
            {key === "multiLinkPlatforms"
              ? parseMultiLinkPlatforms(value)
                  .map(multiLinkPlatformLabel)
                  .join(", ")
              : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
