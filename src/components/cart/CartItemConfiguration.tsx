const CONFIGURATION_FIELD_LABELS: Record<string, string> = {
  businessQuery: "Business",
  manualDetails: "Business details",
  instagramHandle: "Instagram",
  businessName: "Business",
  destination: "Destination",
  notes: "Notes",
  logoFileName: "Logo",
};

/**
 * Concise, human-readable summary of a cart line's captured configuration
 * (Instagram handle, Google business details, custom branding info, etc.)
 * so a customer can spot a typo before paying. Shared by the cart drawer
 * and the /cart page via `CartLineItem`. Renders nothing if there's no
 * configuration, or every field on it is empty — never dumps raw JSON.
 */
export function CartItemConfiguration({ configuration }: { configuration?: Record<string, string> }) {
  if (!configuration) return null;

  const entries = Object.entries(configuration).filter(([, value]) => value.trim() !== "");
  if (entries.length === 0) return null;

  return (
    <dl className="flex flex-col gap-1.5 rounded-[var(--tf-radius-sm)] bg-tf-neutral-100 px-3 py-2.5">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-tf-neutral-500">
            {CONFIGURATION_FIELD_LABELS[key] ?? key}
          </dt>
          <dd className="line-clamp-2 text-xs text-tf-neutral-700">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
