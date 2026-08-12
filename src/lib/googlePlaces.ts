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

type GoogleMapsNamespace = {
  importLibrary?: (library: string, ...args: unknown[]) => Promise<unknown>;
  [key: string]: unknown;
};

declare global {
  interface Window {
    google?: {
      maps?: GoogleMapsNamespace;
    };
    [key: string]: unknown;
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

/**
 * ROOT CAUSE this fixes: the previous loader injected a plain
 * `<script src="https://maps.googleapis.com/maps/api/js?key=...
 * &libraries=places&loading=async&v=weekly">` tag, then — once the tag's
 * own `onload` fired — assumed `window.google.maps.importLibrary` would
 * exist. It doesn't reliably: a script loaded that way (`libraries=`
 * baked directly into the URL) populates the classic `google.maps.places.*`
 * namespace, but `importLibrary` is only guaranteed to exist when the page
 * goes through Google's documented "Dynamic Library Import" bootstrap
 * mechanism — which works the other way around. That mechanism defines
 * `google.maps.importLibrary` as a small stub FIRST, synchronously, before
 * any network request is even made; calling the stub is what triggers
 * loading the real script (signalled via a `callback` query param, not the
 * script tag's `onload`). Once the real script finishes executing, it
 * overwrites the stub with its true implementation. `window.google.maps`
 * existing is therefore never proof `importLibrary` is ready — only a
 * resolved `importLibrary(...)` call is (see `loadPlacesLibrary` below).
 *
 * This function reimplements that same "stub now, real script overwrites
 * it later" contract — the mechanism Google's own bootstrap loader snippet
 * uses — in typed, readable TypeScript rather than pasting Google's
 * published minified inline snippet verbatim. Idempotent: if
 * `importLibrary` already exists (stub or real), it's a no-op, so calling
 * this again on client-side navigation or a remount never re-installs the
 * stub or injects a second script tag.
 */
function ensureGoogleMapsBootstrap(apiKey: string): void {
  const google = (window.google ??= {});
  const maps = (google.maps ??= {});

  if (typeof maps.importLibrary === "function") return; // Stub or real implementation already installed — nothing to do.

  const requestedLibraries = new Set<string>();
  let scriptLoadPromise: Promise<void> | null = null;

  function loadScriptOnce(): Promise<void> {
    if (scriptLoadPromise) return scriptLoadPromise;

    scriptLoadPromise = new Promise<void>((resolve, reject) => {
      // A plain top-level global callback name — the long-established,
      // unambiguous form of Google's `callback` contract (the same shape
      // as the classic `callback=initMap` pattern), rather than a nested
      // dotted path, to keep this reliably interoperable with the real
      // script Google serves.
      const callbackName = "__tapfiveGoogleMapsReady__";
      window[callbackName] = () => {
        delete window[callbackName];
        resolve();
      };

      const params = new URLSearchParams({
        key: apiKey,
        v: "weekly",
        libraries: [...requestedLibraries].join(","),
        callback: callbackName,
        loading: "async",
      });

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.async = true;
      script.onerror = () => {
        scriptLoadPromise = null;
        delete window[callbackName];
        reject(new Error("Google Maps script failed to load."));
      };
      const nonce = document.querySelector("script[nonce]")?.getAttribute("nonce");
      if (nonce) script.nonce = nonce;

      document.head.appendChild(script);
    });

    return scriptLoadPromise;
  }

  // The stub: records which library was asked for, ensures the (single,
  // shared) script request is in flight, and — once it resolves — calls
  // whatever `importLibrary` is installed by then. By that point Google's
  // real script has overwritten this stub with its true implementation,
  // so this delegates to the real one rather than recursing into itself.
  maps.importLibrary = (libraryName: string, ...rest: unknown[]) => {
    requestedLibraries.add(libraryName);
    return loadScriptOnce().then(() => {
      const real = maps.importLibrary;
      if (typeof real !== "function") {
        throw new Error("Google Maps script loaded but did not define importLibrary.");
      }
      return real(libraryName, ...rest);
    });
  };
}

let placesLibraryPromise: Promise<GooglePlacesLibrary> | null = null;

/**
 * Loads (once — cached at module scope, so remounting the search UI never
 * re-triggers the bootstrap or injects a second script tag) and returns
 * the Places library. Rejects cleanly — never throws synchronously — so
 * callers can show a graceful "search unavailable" state instead of
 * crashing the product page.
 *
 * Readiness is proven by successfully resolving `importLibrary("places")`
 * itself — never merely by `window.google.maps` existing (see the long
 * comment on `ensureGoogleMapsBootstrap` above for why that distinction is
 * exactly what broke this in production).
 */
export function loadPlacesLibrary(): Promise<GooglePlacesLibrary> {
  if (placesLibraryPromise) return placesLibraryPromise;

  const apiKey = getApiKey();
  if (!apiKey) {
    return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured."));
  }

  ensureGoogleMapsBootstrap(apiKey);

  placesLibraryPromise = window
    .google!.maps!.importLibrary!("places")
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
