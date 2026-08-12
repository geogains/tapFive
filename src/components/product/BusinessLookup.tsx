"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isGooglePlacesConfigured,
  loadPlacesLibrary,
  createSessionToken,
  searchBusinesses,
  fetchBusinessDetails,
  type BusinessSuggestion,
  type GooglePlacePrediction,
  type GoogleAutocompleteSessionToken,
  type GooglePlacesLibrary,
} from "@/lib/googlePlaces";

export type BusinessLookupValue = {
  googlePlaceId: string;
  businessName: string;
  businessAddress: string;
  googleMapsUrl: string;
  manualDetails: string;
  requiresManualGoogleVerification: string;
};

type BusinessLookupProps = {
  value: BusinessLookupValue;
  onChange: (value: BusinessLookupValue) => void;
  /** Shown when neither a search selection nor manual details satisfy the requirement. */
  error?: string;
};

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 350;

type SuggestionEntry = { suggestion: BusinessSuggestion; prediction: GooglePlacePrediction };

/**
 * Google Business Profile finder for the Google Review Card's "Find your
 * business" step. Wraps Google's current Places JS library (see
 * `src/lib/googlePlaces.ts` — `AutocompleteSuggestion`/`Place`, not the
 * legacy `Autocomplete` widget) behind a fully custom, on-brand dropdown.
 *
 * Captures the genuine Google `googlePlaceId` alongside the business
 * name/address on selection — the customer never sees or needs to know
 * what a Place ID is. Preserves the "Can't find your business?" manual
 * fallback for businesses the finder can't locate, which never fabricates
 * a Place ID (see `requiresManualGoogleVerification`).
 */
export function BusinessLookup({ value, onChange, error }: BusinessLookupProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchUnavailable, setSearchUnavailable] = useState(false);
  const [manuallyToggled, setManuallyToggled] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const libRef = useRef<GooglePlacesLibrary | null>(null);
  const sessionTokenRef = useRef<GoogleAutocompleteSessionToken | null>(null);
  const requestIdRef = useRef(0);

  const isSelected = value.googlePlaceId.trim() !== "" && value.businessName.trim() !== "";
  const showManualEntry = manuallyToggled || Boolean(error);

  // Load the Places library once, lazily — never at module scope, and
  // never if the key simply isn't configured (fails gracefully, doesn't
  // throw, doesn't block the rest of the product page).
  useEffect(() => {
    if (isSelected) return; // Already have a confirmed business — no need to load search.
    if (!isGooglePlacesConfigured()) {
      // Intentional: reacting to an environment condition only knowable
      // client-side, not something derivable during render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchUnavailable(true);
      return;
    }

    let cancelled = false;
    loadPlacesLibrary()
      .then((lib) => {
        if (cancelled) return;
        libRef.current = lib;
        sessionTokenRef.current = createSessionToken(lib);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("Google Places failed to load:", err instanceof Error ? err.message : err);
        setSearchUnavailable(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isSelected]);

  // Debounced search — waits for a pause in typing, requires a minimum
  // query length, guards against a slow older response overwriting a
  // faster newer one, and surfaces a loading state while in flight.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      // Intentional: clearing stale results as the query itself changes,
      // not something derivable purely from render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      setIsDropdownOpen(false);
      setIsSearching(false);
      return;
    }

    const requestId = ++requestIdRef.current;

    const timeout = setTimeout(() => {
      const lib = libRef.current;
      const token = sessionTokenRef.current;
      if (!lib || !token) {
        setSearchUnavailable(true);
        return;
      }

      setIsSearching(true);
      setIsDropdownOpen(true);

      searchBusinesses(lib, trimmed, token)
        .then((results) => {
          if (requestIdRef.current !== requestId) return; // A newer search has since started — discard this stale response.
          setSuggestions(results);
          setIsSearching(false);
        })
        .catch((err: unknown) => {
          if (requestIdRef.current !== requestId) return;
          console.error("Google Places search failed:", err instanceof Error ? err.message : err);
          setSuggestions([]);
          setIsSearching(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  // Close the results dropdown on an outside click.
  useEffect(() => {
    if (!isDropdownOpen) return;
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isDropdownOpen]);

  const handleSelect = async (entry: SuggestionEntry) => {
    setIsDropdownOpen(false);
    setQuery("");
    setSuggestions([]);

    const lib = libRef.current;
    const token = sessionTokenRef.current;
    if (!lib || !token) {
      setSearchUnavailable(true);
      return;
    }

    try {
      const details = await fetchBusinessDetails(entry.prediction, token);
      onChange({
        googlePlaceId: details.placeId,
        businessName: details.name,
        businessAddress: details.formattedAddress,
        googleMapsUrl: "",
        manualDetails: "",
        requiresManualGoogleVerification: "false",
      });
      // Selection ends this session — a future search starts a fresh one.
      sessionTokenRef.current = createSessionToken(lib);
    } catch (err) {
      console.error("Failed to fetch selected business details:", err instanceof Error ? err.message : err);
      setSearchUnavailable(true);
    }
  };

  const handleChangeBusiness = () => {
    onChange({
      googlePlaceId: "",
      businessName: "",
      businessAddress: "",
      googleMapsUrl: "",
      manualDetails: "",
      requiresManualGoogleVerification: "",
    });
    setQuery("");
  };

  const handleManualFieldChange = (patch: Partial<BusinessLookupValue>) => {
    onChange({ ...value, ...patch, googlePlaceId: "", requiresManualGoogleVerification: "true" });
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-3 rounded-[var(--tf-radius-lg)] border border-tf-neutral-200 p-5"
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-base font-medium tracking-tight text-tf-black">
          Find your business
        </h3>
        <p className="text-sm leading-relaxed text-tf-neutral-600">
          Search for your Google Business Profile so we can configure your card before it arrives.
        </p>
      </div>

      {isSelected ? (
        <SelectedBusinessCard
          name={value.businessName}
          address={value.businessAddress}
          onChangeBusiness={handleChangeBusiness}
        />
      ) : searchUnavailable ? (
        <div className="flex flex-col gap-3">
          <p className="text-xs leading-relaxed text-tf-neutral-500">
            Business search isn&apos;t available right now — add your details below instead and we&apos;ll
            verify and configure the right review link with you before dispatch.
          </p>
          <ManualBusinessForm value={value} onFieldChange={handleManualFieldChange} />
        </div>
      ) : (
        <>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tf-neutral-400"
              aria-hidden="true"
            />
            <input
              type="text"
              role="combobox"
              aria-expanded={isDropdownOpen}
              aria-controls="business-search-results"
              aria-autocomplete="list"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setIsDropdownOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsDropdownOpen(false);
              }}
              placeholder="Start typing your business name…"
              aria-label="Search for your business"
              aria-invalid={error ? true : undefined}
              className={cn(
                "tf-focus-ring w-full rounded-[var(--tf-radius-sm)] border bg-tf-white py-2.5 pl-10 pr-3.5 text-sm text-tf-black placeholder:text-tf-neutral-400",
                error ? "border-red-300" : "border-tf-neutral-200",
              )}
            />

            {isDropdownOpen ? (
              <div
                id="business-search-results"
                role="listbox"
                aria-label="Matching businesses"
                className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-[var(--tf-radius-md)] border border-tf-neutral-200 bg-tf-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.2)]"
              >
                {isSearching ? (
                  <p className="px-4 py-3 text-sm text-tf-neutral-500">Searching…</p>
                ) : suggestions.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-tf-neutral-500">No matching businesses found.</p>
                ) : (
                  <ul className="max-h-64 overflow-y-auto py-1">
                    {suggestions.map((entry) => (
                      <li key={entry.suggestion.placeId}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={false}
                          onClick={() => handleSelect(entry)}
                          className="tf-focus-ring flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition-colors hover:bg-tf-neutral-100"
                        >
                          <span className="text-sm font-medium text-tf-black">{entry.suggestion.primaryText}</span>
                          {entry.suggestion.secondaryText ? (
                            <span className="text-xs text-tf-neutral-500">{entry.suggestion.secondaryText}</span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {/* Required Google attribution for predictions shown without an accompanying map. */}
                <div className="border-t border-tf-neutral-100 px-4 py-1.5 text-right text-[10px] text-tf-neutral-400">
                  Powered by Google
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setManuallyToggled((current) => !current)}
            aria-expanded={showManualEntry}
            className="tf-focus-ring self-start text-xs font-medium text-tf-neutral-500 underline-offset-2 hover:text-tf-black hover:underline"
          >
            {showManualEntry ? "Search for your business instead" : "Can't find your business?"}
          </button>

          {showManualEntry ? (
            <div className="flex flex-col gap-3 rounded-[var(--tf-radius-sm)] bg-tf-neutral-100 p-4">
              <p className="text-xs leading-relaxed text-tf-neutral-600">
                No problem — add your business details below and our team will verify and configure the
                right review link with you before your card is dispatched.
              </p>
              <ManualBusinessForm value={value} onFieldChange={handleManualFieldChange} />
            </div>
          ) : null}
        </>
      )}

      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

function SelectedBusinessCard({
  name,
  address,
  onChangeBusiness,
}: {
  name: string;
  address: string;
  onChangeBusiness: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[var(--tf-radius-md)] border border-tf-accent/30 bg-tf-accent-soft px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tf-accent text-tf-white"
          aria-hidden="true"
        >
          <Check className="h-3 w-3" />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-tf-black">{name}</span>
          {address ? <span className="text-xs text-tf-neutral-600">{address}</span> : null}
        </div>
      </div>
      <button
        type="button"
        onClick={onChangeBusiness}
        className="tf-focus-ring shrink-0 whitespace-nowrap text-xs font-medium text-tf-neutral-500 underline-offset-2 hover:text-tf-black hover:underline"
      >
        Change business
      </button>
    </div>
  );
}

/** The structured manual fallback: business name, address/postcode, and an optional Google Maps link — never fabricates a Place ID. */
function ManualBusinessForm({
  value,
  onFieldChange,
}: {
  value: BusinessLookupValue;
  onFieldChange: (patch: Partial<BusinessLookupValue>) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <ManualField
        id="google-manual-business-name"
        label="Business name"
        value={value.businessName}
        onChange={(businessName) => onFieldChange({ businessName })}
        placeholder="e.g. Hills Barbers"
      />
      <ManualField
        id="google-manual-business-address"
        label="Business address or postcode"
        value={value.businessAddress}
        onChange={(businessAddress) => onFieldChange({ businessAddress })}
        placeholder="e.g. Plymouth, PL1 2AB"
      />
      <ManualField
        id="google-manual-maps-url"
        label="Google Maps link (optional)"
        value={value.googleMapsUrl}
        onChange={(googleMapsUrl) => onFieldChange({ googleMapsUrl })}
        placeholder="Paste a Google Maps share link if you have one"
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="google-manual-details" className="text-xs font-medium text-tf-neutral-600">
          Anything else that helps? (optional)
        </label>
        <textarea
          id="google-manual-details"
          value={value.manualDetails}
          onChange={(event) => onFieldChange({ manualDetails: event.target.value })}
          placeholder="Any other details that will help us find your listing…"
          rows={2}
          className="tf-focus-ring w-full resize-none rounded-[var(--tf-radius-sm)] border border-tf-neutral-200 bg-tf-white p-3 text-sm text-tf-black placeholder:text-tf-neutral-400"
        />
      </div>
    </div>
  );
}

function ManualField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-tf-neutral-600">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="tf-focus-ring w-full rounded-[var(--tf-radius-sm)] border border-tf-neutral-200 bg-tf-white px-3.5 py-2.5 text-sm text-tf-black placeholder:text-tf-neutral-400"
      />
    </div>
  );
}
