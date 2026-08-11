import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase admin client. Never import this from a Client
 * Component — `SUPABASE_SECRET_KEY` is a privileged key that bypasses Row
 * Level Security entirely (see `supabase/migrations/`, which enables RLS
 * on `orders`/`order_items` with NO anon/authenticated policies — this key
 * is the only way to read or write those tables at all) and must never
 * reach the browser bundle, be logged, or be returned from an API
 * response.
 *
 * Lazily constructed, matching `stripeClient.ts` — importing this module
 * (which happens as soon as Next.js collects route data for the API
 * routes at build time) must not itself require the environment variables
 * to be present. They're only required once a request actually needs to
 * talk to Supabase.
 */
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SECRET_KEY must both be set as server-side environment variables (never NEXT_PUBLIC_) before order persistence can run.",
    );
  }

  supabaseClient = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return supabaseClient;
}
