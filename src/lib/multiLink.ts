/**
 * Multi-Link Card platform catalogue and selection encoding.
 *
 * Shared by the client configuration UI (`MultiLinkConfiguration`) and the
 * server-side order validation (`validateOrderConfiguration`) — this file
 * has no "use client" directive and touches no browser APIs, so it's safe
 * to import from both, and is the single source of truth for which
 * platform ids are valid and how a multi-select is packed into the flat
 * string-only configuration shape the rest of the cart/order pipeline uses.
 */

export type MultiLinkPlatformId = "google" | "instagram" | "facebook" | "tiktok" | "tripadvisor" | "trustpilot";

export const MULTI_LINK_PLATFORMS: { id: MultiLinkPlatformId; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "tripadvisor", label: "Tripadvisor" },
  { id: "trustpilot", label: "Trustpilot" },
];

const PLATFORM_IDS = new Set<string>(MULTI_LINK_PLATFORMS.map((platform) => platform.id));

export const MIN_MULTI_LINK_PLATFORMS = 2;

/**
 * Parses the comma-separated `multiLinkPlatforms` configuration field back
 * into platform ids — dropping anything unrecognised (never trusts client
 * input to only contain valid ids) and always returning them in the fixed
 * `MULTI_LINK_PLATFORMS` order, so selection order never affects the
 * derived cart line id or display order.
 */
export function parseMultiLinkPlatforms(value: string): MultiLinkPlatformId[] {
  const selected = new Set(
    value
      .split(",")
      .map((id) => id.trim())
      .filter((id) => PLATFORM_IDS.has(id)),
  );
  return MULTI_LINK_PLATFORMS.map((platform) => platform.id).filter((id) => selected.has(id));
}

export function serializeMultiLinkPlatforms(ids: MultiLinkPlatformId[]): string {
  return ids.join(",");
}

export function multiLinkPlatformLabel(id: string): string {
  return MULTI_LINK_PLATFORMS.find((platform) => platform.id === id)?.label ?? id;
}
