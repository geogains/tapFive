/**
 * Multi-Link Card business-logo upload: shared constants, the persisted
 * reference shape, and pure validation helpers.
 *
 * Imported by both the client upload UI (`MultiLinkConfiguration`) and
 * server code (`/api/multi-link/logo` route, `validateOrderConfiguration`)
 * — no "use client", no Node/browser-only APIs — so both sides agree on
 * exactly what a legitimate logo reference looks like. The server is the
 * only thing that ever writes to Storage; nothing here trusts a client
 * value just because it has the right shape (see `isValidLogoPath` — it's
 * a format check, not proof the object exists).
 */

export const MULTI_LINK_LOGO_BUCKET = "multilink-logos";

export const ALLOWED_LOGO_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export type AllowedLogoMimeType = (typeof ALLOWED_LOGO_MIME_TYPES)[number];

export const MAX_LOGO_FILE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Object paths are always `<uuid-v4>/logo.<ext>` — a server-generated
 * random id, never the original filename, a business name, or an email.
 * This pattern is also the server-side allow-list for what counts as a
 * "safe" path: no traversal (`..`), no extra segments, no unexpected
 * extensions.
 */
const LOGO_PATH_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/logo\.(png|jpe?g|webp)$/i;

export function isValidLogoPath(path: string): boolean {
  return LOGO_PATH_PATTERN.test(path);
}

export function isAllowedLogoMimeType(mimeType: string): mimeType is AllowedLogoMimeType {
  return (ALLOWED_LOGO_MIME_TYPES as readonly string[]).includes(mimeType);
}

/** The file extension a legitimately-uploaded object's path must end in for a given mime type — used to cross-check a client-submitted (path, mimeType) pair actually agree with each other. */
export function extensionForMimeType(mimeType: string): string | null {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

export function pathMatchesMimeType(path: string, mimeType: string): boolean {
  const ext = extensionForMimeType(mimeType);
  if (!ext) return false;
  // "jpg" must also accept a path ending ".jpeg" — both map to image/jpeg.
  const pathExt = path.split(".").pop()?.toLowerCase();
  if (ext === "jpg") return pathExt === "jpg" || pathExt === "jpeg";
  return pathExt === ext;
}

/** A validated, persisted reference to a business logo already uploaded to Storage. Never carries file bytes or a signed/expiring URL — see MultiLinkConfiguration.tsx and the upload route for why. */
export type MultiLinkLogoReference = {
  bucket: string;
  path: string;
  originalName: string;
  mimeType: string;
};

/**
 * Full validity check for a logo reference as submitted by a client (cart
 * configuration, order configuration) — never trust the shape alone.
 * Confirms the bucket is exactly the known constant (never client-chosen),
 * the path matches the safe generated-path pattern, the mime type is one
 * of the allowed set, and the path's extension actually agrees with the
 * claimed mime type.
 */
export function isValidLogoReference(ref: Partial<MultiLinkLogoReference>): ref is MultiLinkLogoReference {
  if (ref.bucket !== MULTI_LINK_LOGO_BUCKET) return false;
  if (typeof ref.path !== "string" || !isValidLogoPath(ref.path)) return false;
  if (typeof ref.mimeType !== "string" || !isAllowedLogoMimeType(ref.mimeType)) return false;
  if (!pathMatchesMimeType(ref.path, ref.mimeType)) return false;
  return true;
}
