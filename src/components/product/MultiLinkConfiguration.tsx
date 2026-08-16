"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Check, ImageOff, Loader2, RefreshCw, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BusinessLookup } from "@/components/product/BusinessLookup";
import { InstagramConfigField } from "@/components/product/InstagramConfigField";
import {
  MULTI_LINK_PLATFORMS,
  MIN_MULTI_LINK_PLATFORMS,
  parseMultiLinkPlatforms,
  serializeMultiLinkPlatforms,
  type MultiLinkPlatformId,
} from "@/lib/multiLink";
import {
  ALLOWED_LOGO_MIME_TYPES,
  MAX_LOGO_FILE_BYTES,
  isAllowedLogoMimeType,
  type MultiLinkLogoReference,
} from "@/lib/multiLinkLogo";

export type MultiLinkConfigValue = {
  multiLinkPlatforms: string;
  googlePlaceId: string;
  businessName: string;
  businessAddress: string;
  googleMapsUrl: string;
  manualDetails: string;
  requiresManualGoogleVerification: string;
  instagramHandle: string;
  facebookUrl: string;
  tiktokHandle: string;
  tripadvisorUrl: string;
  trustpilotUrl: string;
  primaryColor: string;
  secondaryColor: string;
  multiLinkLogoBucket: string;
  multiLinkLogoPath: string;
  multiLinkLogoOriginalName: string;
  multiLinkLogoMimeType: string;
};

export type MultiLinkConfigErrors = Partial<Record<keyof MultiLinkConfigValue, string>>;

type MultiLinkConfigurationProps = {
  value: MultiLinkConfigValue;
  onChange: (value: MultiLinkConfigValue) => void;
  errors?: MultiLinkConfigErrors;
  /** Fires whenever the logo upload's in-flight state changes, so the parent can disable Add to Cart until it settles. */
  onUploadingChange?: (isUploading: boolean) => void;
};

/**
 * Multi-Link Card purchase configuration: pick 2+ destination platforms,
 * fill in whichever field each selected platform needs, upload a business
 * logo (required — it's printed on the card, and now a real Supabase
 * Storage upload, not just a captured filename — see `LogoUploadField`),
 * and optionally set brand colours.
 */
export function MultiLinkConfiguration({ value, onChange, errors, onUploadingChange }: MultiLinkConfigurationProps) {
  const [colorsExpanded, setColorsExpanded] = useState(
    value.primaryColor.trim() !== "" || value.secondaryColor.trim() !== "",
  );

  const selectedPlatforms = parseMultiLinkPlatforms(value.multiLinkPlatforms);

  const togglePlatform = (id: MultiLinkPlatformId) => {
    const next = selectedPlatforms.includes(id)
      ? selectedPlatforms.filter((platformId) => platformId !== id)
      : [...selectedPlatforms, id];
    onChange({ ...value, multiLinkPlatforms: serializeMultiLinkPlatforms(next) });
  };

  const toggleColors = () => {
    const next = !colorsExpanded;
    setColorsExpanded(next);
    if (!next) onChange({ ...value, primaryColor: "", secondaryColor: "" });
  };

  return (
    <div className="flex flex-col gap-6 rounded-[var(--tf-radius-lg)] border border-tf-neutral-200 p-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-base font-medium tracking-tight text-tf-black">
            Choose your platforms
          </h3>
          <p className="text-sm leading-relaxed text-tf-neutral-600">
            Select at least {MIN_MULTI_LINK_PLATFORMS} platforms — customers will see a button for each
            one you choose.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Platforms">
          {MULTI_LINK_PLATFORMS.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id);
            return (
              <button
                key={platform.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => togglePlatform(platform.id)}
                className={cn(
                  "tf-focus-ring flex items-center gap-2 rounded-[var(--tf-radius-sm)] border px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isSelected
                    ? "border-tf-accent bg-tf-accent-soft text-tf-black"
                    : "border-tf-neutral-200 text-tf-neutral-600 hover:border-tf-neutral-400",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isSelected ? "border-tf-accent bg-tf-accent" : "border-tf-neutral-300",
                  )}
                >
                  {isSelected ? <Check className="h-2.5 w-2.5 text-tf-white" aria-hidden="true" /> : null}
                </span>
                {platform.label}
              </button>
            );
          })}
        </div>

        {errors?.multiLinkPlatforms ? (
          <p className="text-xs font-medium text-red-600">{errors.multiLinkPlatforms}</p>
        ) : null}
      </div>

      {selectedPlatforms.length > 0 ? (
        <div className="flex flex-col gap-4">
          {selectedPlatforms.map((platformId) => (
            <PlatformField key={platformId} platformId={platformId} value={value} onChange={onChange} errors={errors} />
          ))}
        </div>
      ) : null}

      <LogoUploadField value={value} onChange={onChange} error={errors?.multiLinkLogoPath} onUploadingChange={onUploadingChange} />

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={toggleColors}
          aria-expanded={colorsExpanded}
          className="tf-focus-ring self-start text-xs font-medium text-tf-neutral-500 underline-offset-2 hover:text-tf-black hover:underline"
        >
          {colorsExpanded ? "Remove custom colours" : "Customise your card colours (optional)"}
        </button>

        {colorsExpanded ? (
          <div className="grid grid-cols-2 gap-4">
            <ColorField
              id="multi-link-primary-color"
              label="Primary colour"
              value={value.primaryColor}
              onChange={(primaryColor) => onChange({ ...value, primaryColor })}
            />
            <ColorField
              id="multi-link-secondary-color"
              label="Secondary colour"
              value={value.secondaryColor}
              onChange={(secondaryColor) => onChange({ ...value, secondaryColor })}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PlatformField({
  platformId,
  value,
  onChange,
  errors,
}: {
  platformId: MultiLinkPlatformId;
  value: MultiLinkConfigValue;
  onChange: (value: MultiLinkConfigValue) => void;
  errors?: MultiLinkConfigErrors;
}) {
  if (platformId === "google") {
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

  if (platformId === "instagram") {
    return (
      <InstagramConfigField
        value={value.instagramHandle}
        onChange={(instagramHandle) => onChange({ ...value, instagramHandle })}
        error={errors?.instagramHandle}
      />
    );
  }

  if (platformId === "facebook") {
    return (
      <SimplePlatformField
        id="multi-link-facebook"
        label="Facebook"
        placeholder="facebook.com/yourbusiness"
        value={value.facebookUrl}
        onChange={(facebookUrl) => onChange({ ...value, facebookUrl })}
        error={errors?.facebookUrl}
      />
    );
  }

  if (platformId === "tiktok") {
    return (
      <SimplePlatformField
        id="multi-link-tiktok"
        label="TikTok"
        placeholder="@yourbusiness"
        value={value.tiktokHandle}
        onChange={(tiktokHandle) => onChange({ ...value, tiktokHandle })}
        error={errors?.tiktokHandle}
      />
    );
  }

  if (platformId === "tripadvisor") {
    return (
      <SimplePlatformField
        id="multi-link-tripadvisor"
        label="Tripadvisor"
        placeholder="tripadvisor.co.uk/your-listing"
        value={value.tripadvisorUrl}
        onChange={(tripadvisorUrl) => onChange({ ...value, tripadvisorUrl })}
        error={errors?.tripadvisorUrl}
      />
    );
  }

  return (
    <SimplePlatformField
      id="multi-link-trustpilot"
      label="Trustpilot"
      placeholder="trustpilot.com/review/yourbusiness.com"
      value={value.trustpilotUrl}
      onChange={(trustpilotUrl) => onChange({ ...value, trustpilotUrl })}
      error={errors?.trustpilotUrl}
    />
  );
}

function SimplePlatformField({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[var(--tf-radius-lg)] border border-tf-neutral-200 p-5">
      <label htmlFor={id} className="text-xs font-medium text-tf-neutral-600">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={cn(
          "tf-focus-ring w-full rounded-[var(--tf-radius-sm)] border bg-tf-white px-3.5 py-2.5 text-sm text-tf-black placeholder:text-tf-neutral-400",
          error ? "border-red-300" : "border-tf-neutral-200",
        )}
      />
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

const ACCEPTED_FILE_INPUT_TYPES = ALLOWED_LOGO_MIME_TYPES.join(",");
const MAX_LOGO_FILE_MB = (MAX_LOGO_FILE_BYTES / (1024 * 1024)).toFixed(0);

type LogoUploadStatus = "idle" | "uploading" | "error";

/**
 * Business logo upload: selecting a file uploads it immediately to
 * `/api/multi-link/logo` (server-mediated — see that route for why) and
 * stores the returned Storage reference, never the raw `File` or a local
 * filename, in configuration state. Add to Cart is gated on a real
 * reference existing (`validateProductConfiguration`) and, via
 * `onUploadingChange`, on no upload currently being in flight.
 */
function LogoUploadField({
  value,
  onChange,
  error,
  onUploadingChange,
}: {
  value: MultiLinkConfigValue;
  onChange: (value: MultiLinkConfigValue) => void;
  error?: string;
  onUploadingChange?: (isUploading: boolean) => void;
}) {
  const [status, setStatus] = useState<LogoUploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // The blob URL matching the LAST SUCCESSFULLY uploaded file — kept
  // separately from `previewUrl` (what's currently shown) so a failed
  // replace attempt can revert the preview to this instead of losing it.
  const committedPreviewUrlRef = useRef<string | null>(null);

  const hasLogo = value.multiLinkLogoPath.trim() !== "";

  // Revoke whichever blob URL is still live on unmount — these are never
  // persisted anywhere, only used for the immediate local preview.
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const setUploading = (isUploading: boolean) => {
    setStatus(isUploading ? "uploading" : "idle");
    onUploadingChange?.(isUploading);
  };

  const deleteObject = (ref: Pick<MultiLinkLogoReference, "path">) => {
    // Best-effort cleanup only — never blocks the customer's own flow, and
    // never runs for a logo that's part of a placed order (this component
    // only exists pre-checkout).
    fetch("/api/multi-link/logo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: ref.path }),
    }).catch((err: unknown) => {
      console.error("Failed to clean up replaced/removed logo:", err instanceof Error ? err.message : err);
    });
  };

  const handleFileSelected = async (file: File) => {
    setUploadError(null);

    if (!isAllowedLogoMimeType(file.type)) {
      setStatus("error");
      setUploadError("Unsupported file type. Please upload a PNG, JPG or WebP image.");
      return;
    }

    if (file.size > MAX_LOGO_FILE_BYTES) {
      setStatus("error");
      setUploadError(`File is too large. Maximum size is ${MAX_LOGO_FILE_MB}MB.`);
      return;
    }

    const previousReference = hasLogo
      ? { bucket: value.multiLinkLogoBucket, path: value.multiLinkLogoPath }
      : null;

    const localPreviewUrl = URL.createObjectURL(file);
    // First upload: show the new preview immediately. Replacing an existing
    // logo: keep the old preview visible (via `previewUrl` staying as-is)
    // until the new upload actually succeeds, so a failed replace doesn't
    // leave the customer looking at a broken/empty state.
    if (!hasLogo) setPreviewUrl(localPreviewUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/multi-link/logo", { method: "POST", body: formData });
      const body: { bucket?: string; path?: string; originalName?: string; mimeType?: string; error?: string } =
        await response.json().catch(() => ({}));

      if (!response.ok || !body.bucket || !body.path || !body.mimeType) {
        throw new Error(body.error || "Upload failed. Please try again.");
      }

      if (committedPreviewUrlRef.current) URL.revokeObjectURL(committedPreviewUrlRef.current);
      committedPreviewUrlRef.current = localPreviewUrl;
      setPreviewUrl(localPreviewUrl);

      onChange({
        ...value,
        multiLinkLogoBucket: body.bucket,
        multiLinkLogoPath: body.path,
        multiLinkLogoOriginalName: body.originalName ?? file.name,
        multiLinkLogoMimeType: body.mimeType,
      });

      if (previousReference && previousReference.path !== body.path) {
        deleteObject(previousReference);
      }
    } catch (err) {
      URL.revokeObjectURL(localPreviewUrl);
      // Revert the preview to whatever was last committed (or nothing, on
      // a first-time upload failure) rather than leaving a dead blob URL.
      setPreviewUrl(committedPreviewUrlRef.current);
      setStatus("error");
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      return;
    }

    setUploading(false);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so selecting the same file again still fires this handler.
    event.target.value = "";
    if (file) void handleFileSelected(file);
  };

  const handleRemove = () => {
    const pathToDelete = value.multiLinkLogoPath;
    onChange({
      ...value,
      multiLinkLogoBucket: "",
      multiLinkLogoPath: "",
      multiLinkLogoOriginalName: "",
      multiLinkLogoMimeType: "",
    });
    if (committedPreviewUrlRef.current) {
      URL.revokeObjectURL(committedPreviewUrlRef.current);
      committedPreviewUrlRef.current = null;
    }
    setPreviewUrl(null);
    setStatus("idle");
    setUploadError(null);
    if (pathToDelete) deleteObject({ path: pathToDelete });
  };

  const isUploading = status === "uploading";
  const showError = status === "error" && uploadError;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-tf-neutral-600">Upload your business logo</label>

      {hasLogo || isUploading ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-[var(--tf-radius-sm)] border px-3.5 py-3",
            error && !hasLogo ? "border-red-300" : "border-tf-neutral-200",
          )}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[var(--tf-radius-sm)] bg-tf-neutral-100">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob: preview of an unpublished, not-yet-persisted-as-a-public-asset upload; next/image's remote-image pipeline doesn't apply here.
              <img src={previewUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              <ImageOff className="h-4 w-4 text-tf-neutral-400" aria-hidden="true" />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm text-tf-black">
              {value.multiLinkLogoOriginalName || "Uploading…"}
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              {isUploading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-tf-neutral-400" aria-hidden="true" />
                  <span className="text-tf-neutral-500">{hasLogo ? "Uploading replacement…" : "Uploading…"}</span>
                </>
              ) : (
                <>
                  <Check className="h-3 w-3 text-tf-accent" aria-hidden="true" />
                  <span className="text-tf-accent">Uploaded</span>
                </>
              )}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              aria-label="Replace logo"
              title="Replace logo"
              className="tf-focus-ring flex h-8 w-8 items-center justify-center rounded-[var(--tf-radius-sm)] text-tf-neutral-500 transition-colors hover:bg-tf-neutral-100 hover:text-tf-black disabled:pointer-events-none disabled:opacity-40"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              aria-label="Remove logo"
              title="Remove logo"
              className="tf-focus-ring flex h-8 w-8 items-center justify-center rounded-[var(--tf-radius-sm)] text-tf-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-40"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="multi-link-logo"
          className={cn(
            "tf-focus-ring flex cursor-pointer items-center gap-3 rounded-[var(--tf-radius-sm)] border border-dashed px-3.5 py-3 text-sm text-tf-neutral-600 transition-colors hover:border-tf-neutral-400",
            error ? "border-red-300" : "border-tf-neutral-300",
          )}
        >
          <Upload className="h-4 w-4 shrink-0 text-tf-neutral-400" aria-hidden="true" />
          <span className="truncate">Choose a file…</span>
        </label>
      )}

      <input
        ref={fileInputRef}
        id="multi-link-logo"
        type="file"
        accept={ACCEPTED_FILE_INPUT_TYPES}
        className="sr-only"
        disabled={isUploading}
        onChange={handleInputChange}
      />

      <p className="text-xs text-tf-neutral-500">PNG, JPG or WebP, up to {MAX_LOGO_FILE_MB}MB.</p>

      {showError ? <p className="text-xs font-medium text-red-600">{uploadError}</p> : null}
      {!showError && error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-tf-neutral-600">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value || "#111111"}
          onChange={(event) => onChange(event.target.value)}
          className="tf-focus-ring h-9 w-9 shrink-0 cursor-pointer rounded-[var(--tf-radius-sm)] border border-tf-neutral-200 bg-tf-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#111111"
          aria-label={`${label} hex value`}
          className="tf-focus-ring w-full rounded-[var(--tf-radius-sm)] border border-tf-neutral-200 bg-tf-white px-3 py-2 text-sm text-tf-black placeholder:text-tf-neutral-400"
        />
      </div>
    </div>
  );
}
