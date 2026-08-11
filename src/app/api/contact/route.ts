import { NextResponse, type NextRequest } from "next/server";
import { createContactSubmission } from "@/lib/server/contactSubmissions";

export const runtime = "nodejs";

// Generous for a contact form — guards against a deliberately oversized payload.
const MAX_BODY_BYTES = 20_000;

const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 320;
const MAX_BUSINESS_NAME_LENGTH = 200;
const MAX_PHONE_LENGTH = 50;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

// Deliberately permissive rather than RFC-5322-exact — good enough to
// reject obvious garbage without rejecting real addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactRequestBody = {
  name?: unknown;
  email?: unknown;
  business?: unknown;
  phone?: unknown;
  subject?: unknown;
  message?: unknown;
  /**
   * Honeypot — a hidden field real browsers never populate (see
   * ContactForm.tsx). Any non-empty value here means a bot filled in every
   * field it could find, so the submission is quietly dropped.
   */
  website?: unknown;
};

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Persists a contact-form submission to Supabase.
 *
 * The browser is only ever trusted to say who's asking and what they're
 * asking — name, email, optional business name/phone/subject, and the
 * message. Everything is re-validated here (never trusting whatever
 * client-side validation the form itself did); `status`, `id`,
 * `created_at` and `updated_at` are never accepted from the client at
 * all — `createContactSubmission` only ever writes the fields listed
 * above, so there is no code path that could let a submitter choose them.
 */
export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  }

  let body: ContactRequestBody;
  try {
    body = await request.json();
  } catch {
    return badRequest("Malformed request body.");
  }

  // Honeypot tripped — almost certainly a bot. Respond as if it succeeded
  // (rather than a 4xx that might prompt a retry with different values),
  // but write nothing.
  if (normalize(body.website) !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = normalize(body.name);
  const email = normalize(body.email);
  const message = normalize(body.message);
  const businessName = normalize(body.business);
  const phone = normalize(body.phone);
  const subject = normalize(body.subject);

  if (!name) return badRequest("Please enter your name.");
  if (name.length > MAX_NAME_LENGTH) return badRequest("Your name is too long.");

  if (!email) return badRequest("Please enter your email address.");
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return badRequest("Please enter a valid email address.");
  }

  if (!message) return badRequest("Please enter a message.");
  if (message.length > MAX_MESSAGE_LENGTH) {
    return badRequest(`Your message is too long (maximum ${MAX_MESSAGE_LENGTH} characters).`);
  }

  if (businessName.length > MAX_BUSINESS_NAME_LENGTH) return badRequest("Business name is too long.");
  if (phone.length > MAX_PHONE_LENGTH) return badRequest("Phone number is too long.");
  if (subject.length > MAX_SUBJECT_LENGTH) return badRequest("Subject is too long.");

  const result = await createContactSubmission({
    name,
    email,
    businessName: businessName || null,
    phone: phone || null,
    subject: subject || null,
    message,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "Unable to send your message right now. Please try again, or email us directly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
