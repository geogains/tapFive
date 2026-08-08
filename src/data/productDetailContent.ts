/**
 * Shared (non-per-product) copy for the individual product detail pages.
 */

export const compatibilitySection = {
  heading: "Compatibility",
  body: "Tap Five cards use NFC, which is built into most modern smartphones. They work with compatible NFC-enabled iPhone and Android devices without any app or setup on the customer's side. Every card also has a printed QR code, which works as a fallback wherever NFC tapping isn't available or isn't supported.",
};

// TODO(shipping): dispatch times, carrier and delivery pricing are not yet
// finalised. Do not add specific promises (e.g. "next-day", "free delivery")
// until this copy is confirmed.
export const shippingSection = {
  heading: "Shipping & Delivery",
  body: "Delivery information coming soon. We'll confirm dispatch timings and delivery options here before checkout goes live.",
};

/** Reassurance row shown near "Add to Cart". Keep conservative — only claims already true elsewhere in the project. */
export const purchaseReassurance = [
  { label: "Secure checkout" },
  { label: "One-time payment — no subscription" },
  { label: "Configured before dispatch" },
];
