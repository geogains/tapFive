import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/server/supabaseClient";

/**
 * Mirrors the equivalent helper in `orders.ts` rather than importing it —
 * that file backs the live Stripe checkout/webhook flow and is
 * deliberately left untouched by this change; duplicating ~8 lines here is
 * a smaller, safer footprint than exporting a helper out of it.
 */
function tryGetSupabaseAdminClient(context: string): SupabaseClient | null {
  try {
    return getSupabaseAdminClient();
  } catch (error) {
    console.error(`Supabase is not available (${context}):`, error instanceof Error ? error.message : error);
    return null;
  }
}

export type ContactSubmissionInput = {
  name: string;
  email: string;
  businessName: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
};

export type CreateContactSubmissionResult = { ok: true } | { ok: false };

/**
 * Inserts a contact-form submission using only server-validated fields
 * (see `src/app/api/contact/route.ts`) — `status` is never set here, so it
 * always takes the database default of `'new'`; there is no code path that
 * lets a submitter choose it, or the row's `id`/`created_at`/`updated_at`.
 */
export async function createContactSubmission(
  input: ContactSubmissionInput,
): Promise<CreateContactSubmissionResult> {
  const supabase = tryGetSupabaseAdminClient("createContactSubmission");
  if (!supabase) return { ok: false };

  const { error } = await supabase.from("contact_submissions").insert({
    name: input.name,
    email: input.email,
    business_name: input.businessName,
    phone: input.phone,
    subject: input.subject,
    message: input.message,
  });

  if (error) {
    console.error("Failed to insert contact submission:", error.message);
    return { ok: false };
  }

  return { ok: true };
}
