/**
 * Client-only loader/wrapper around Google's current ("New") Places JS
 * library — `AutocompleteSuggestion` + `Place`, accessed via
 * `google.maps.importLibrary("places")` — rather than the legacy
 * `google.maps.places.Autocomplete` widget / `AutocompleteService`, which
 * Google's own docs now mark as the legacy path.
 *
 * Hand-rolled minimal types for exactly the surface used below, rather
 * than depending on `@types/google.maps` (whose coverage of this newer
 * API may lag) — keeps `tsc --noEmit` deterministic regardless of that
 * package's state.
 *
 * Never imported from server code, and reads only
 * `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — the intentionally-public, referrer
 * restricted browser key. No secret ever touches this file.
 */

export type GoogleAutocompleteSessionToken = object;

type GooglePlaceTextValue = { text: string } | null | undefined;

export type GooglePlacePrediction = {
  placeId: string;
  mainText?: GooglePlaceTextValue;
  secondaryText?: GooglePlaceTextValue;
  toPlace: () => GooglePlace;
};

type GoogleAutocompleteSuggestion = {
  placePrediction: GooglePlacePrediction | null;
};

type GooglePlace = {
  id: string;
  displayName?: string | null;
  formattedAddress?: string | null;
  fetchFields: (options: {
    fields: string[];
    sessionToken?: GoogleAutocompleteSessionToken;
  }) => Promise<{ place: GooglePlace }>;
};

export type GooglePlacesLibrary = {
  AutocompleteSessionToken: new () => GoogleAutocompleteSessionToken;
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (request: {
      input: string;
      sessionToken: GoogleAutocompleteSessionToken;
      includedRegionCodes?: string[];
      language?: string;
    }) => Promise<{ suggestions: GoogleAutocompleteSuggestion[] }>;
  };
};

declare global {
  interface Window {
    google?: {
      maps?: {
        importLibrary: (library: string) => Promise<unknown>;
      };
    };
  }
}

export type BusinessSuggestion = {
  placeId: string;
  /** Business/place name — Google's `mainText`. */
  primaryText: string;
  /** Address/location — Google's `secondaryText`. Empty string if Google didn't supply one. */
  secondaryText: string;
};

export type SelectedBusiness = {
  placeId: string;
  name: string;
  formattedAddress: string;
};

function getApiKey(): string | null {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return key && key.trim() !== "" ? key.trim() : null;
}

/** Cheap synchronous check the UI can use before even attempting to load anything. */
export function isGooglePlacesConfigured(): boolean {
  return getApiKey() !== null;
}

const SCRIPT_MARKER_ATTR = "data-tapfive-google-maps";

function loadScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.importLibrary) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[${SCRIPT_MARKER_ATTR}]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps script.")));
      return;
    }

    const script = document.createElement("script");
    script.setAttribute(SCRIPT_MARKER_ATTR, "true");
    // `loading=async` + `importLibrary` is Google's current documented
    // loading pattern (replaces the old `libraries=places` synchronous
    // load). The key is the intentionally-public, referrer-restricted
    // browser key — never a secret.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async&v=weekly`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps script."));
    document.head.appendChild(script);
  });
}

let placesLibraryPromise: Promise<GooglePlacesLibrary> | null = null;

/**
 * Loads (once — cached at module scope, so remounting the search UI never
 * injects the script twice) and returns the Places library. Rejects
 * cleanly — never throws synchronously — so callers can show a graceful
 * "search unavailable" state instead of crashing the product page.
 */
export function loadPlacesLibrary(): Promise<GooglePlacesLibrary> {
  if (placesLibraryPromise) return placesLibraryPromise;

  const apiKey = getApiKey();
  if (!apiKey) {
    return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured."));
  }

  placesLibraryPromise = loadScript(apiKey)
    .then(() => window.google!.maps!.importLibrary("places"))
    .then((lib) => lib as GooglePlacesLibrary)
    .catch((error: unknown) => {
      // Don't permanently cache a failed load — a transient network issue
      // shouldn't lock out search for the rest of the session.
      placesLibraryPromise = null;
      throw error;
    });

  return placesLibraryPromise;
}

/**
 * One session token per search-to-selection flow — bundles the
 * autocomplete keystroke requests and the final `fetchFields` place-details
 * call into a single billed Places session, per Google's session-token
 * guidance. Create a fresh one after each selection (or abandoned search).
 */
export function createSessionToken(lib: GooglePlacesLibrary): GoogleAutocompleteSessionToken {
  return new lib.AutocompleteSessionToken();
}

/**
 * Only called once, when the customer actually selects a result — fetches
 * the confirmed name/address/id for that one place, linked to the same
 * session token as the autocomplete request that found it. Takes the raw
 * Google prediction handle captured at suggestion time (see
 * `searchBusinesses` below) rather than re-resolving from a plain string.
 */
export async function fetchBusinessDetails(
  prediction: GooglePlacePrediction,
  sessionToken: GoogleAutocompleteSessionToken,
): Promise<SelectedBusiness> {
  const place = prediction.toPlace();
  const { place: fetched } = await place.fetchFields({
    fields: ["displayName", "formattedAddress", "id"],
    sessionToken,
  });

  return {
    placeId: fetched.id,
    name: fetched.displayName ?? prediction.mainText?.text ?? "",
    formattedAddress: fetched.formattedAddress ?? prediction.secondaryText?.text ?? "",
  };
}

/**
 * Predictions for the dropdown — deliberately does NOT call `fetchFields`
 * for every result (that's a separate, costlier Place Details request);
 * the dropdown only ever needs `mainText`/`secondaryText`, already included
 * in the lightweight prediction. Returns each result paired with Google's
 * raw prediction handle so a later `fetchBusinessDetails` call (only for
 * whichever one the customer actually selects) doesn't need to re-search.
 */
export async function searchBusinesses(
  lib: GooglePlacesLibrary,
  input: string,
  sessionToken: GoogleAutocompleteSessionToken,
): Promise<{ suggestion: BusinessSuggestion; prediction: GooglePlacePrediction }[]> {
  const { suggestions } = await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input,
    sessionToken,
    includedRegionCodes: ["gb"],
  });

  const results: { suggestion: BusinessSuggestion; prediction: GooglePlacePrediction }[] = [];
  for (const s of suggestions) {
    const prediction = s.placePrediction;
    if (!prediction || !prediction.mainText?.text) continue;
    results.push({
      suggestion: {
        placeId: prediction.placeId,
        primaryText: prediction.mainText.text,
        secondaryText: prediction.secondaryText?.text ?? "",
      },
      prediction,
    });
  }
  return results;
}
