/**
 * Builds Tap Five's direct "write a review" URL from a genuine Google Place
 * ID. This is the ONLY place this URL is ever constructed.
 *
 * Never accept a client-submitted `googleReviewUrl` as trusted — always
 * derive it here from a server-validated Place ID (see
 * `validateOrderConfiguration` in `src/lib/server/orderConfiguration.ts`,
 * the sole caller of this function on the trusted path). Kept as a
 * standalone, dependency-free module so it's trivially safe to import from
 * server-only code.
 */
export function buildGoogleReviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}
