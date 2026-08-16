import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/server/supabaseClient";
import {
  MULTI_LINK_LOGO_BUCKET,
  MAX_LOGO_FILE_BYTES,
  isAllowedLogoMimeType,
  isValidLogoPath,
  extensionForMimeType,
} from "@/lib/multiLinkLogo";

// Needs Node APIs (Buffer, the Supabase admin SDK) — not the Edge runtime.
export const runtime = "nodejs";

// Generous margin over MAX_LOGO_FILE_BYTES for multipart/form-data framing
// overhead (boundaries, headers) — this is a cheap pre-check on the
// Content-Length header so an oversized request can be rejected before
// its body is even read, not a substitute for the exact byte check below.
const MAX_REQUEST_BYTES = MAX_LOGO_FILE_BYTES + 1024 * 1024;

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Uploads a Multi-Link Card business logo to Supabase Storage.
 *
 * Server-mediated (browser -> this route -> Supabase), not a direct
 * browser-to-Storage upload: this codebase has no Supabase anon/publishable
 * key or browser client anywhere (only the service-role admin client, used
 * exclusively server-side — see supabaseClient.ts), and every existing
 * Supabase write already goes through a server route this way (checkout,
 * contact form). Introducing anonymous direct-to-Storage uploads would mean
 * inventing a new, wider access pattern (an anon key + RLS policies
 * permitting public writes) that doesn't exist anywhere else in the app.
 *
 * The object path is always server-generated (`<uuid>/logo.<ext>`, see
 * multiLinkLogo.ts) — never the client's filename — so paths are
 * collision-safe, unguessable, and never leak personal information.
 */
export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "File is too large. Maximum size is 5MB." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return badRequest("Malformed upload request.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return badRequest("No file was provided.");
  }

  if (!isAllowedLogoMimeType(file.type)) {
    return badRequest("Unsupported file type. Please upload a PNG, JPG or WebP image.");
  }

  if (file.size > MAX_LOGO_FILE_BYTES) {
    return badRequest("File is too large. Maximum size is 5MB.");
  }

  const extension = extensionForMimeType(file.type);
  if (!extension) {
    // Unreachable given isAllowedLogoMimeType above, but never construct a
    // Storage path from an unvalidated extension.
    return badRequest("Unsupported file type. Please upload a PNG, JPG or WebP image.");
  }

  const path = `${randomUUID()}/logo.${extension}`;
  if (!isValidLogoPath(path)) {
    // Unreachable in practice — defence in depth against ever writing to a
    // path the server's own validators wouldn't later accept back.
    return NextResponse.json({ error: "Unable to process this upload. Please try again." }, { status: 500 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    console.error("Multi-Link logo upload: Supabase is not configured:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Uploads aren't available right now. Please try again later." }, { status: 503 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(MULTI_LINK_LOGO_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("Multi-Link logo upload failed:", uploadError.message);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }

  return NextResponse.json({
    bucket: MULTI_LINK_LOGO_BUCKET,
    path,
    originalName: file.name,
    mimeType: file.type,
  });
}

type DeleteRequestBody = { path?: unknown };

/**
 * Removes a previously-uploaded logo object — called only from the
 * pre-checkout configuration UI when a customer replaces or removes their
 * selection (see MultiLinkConfiguration.tsx). Nothing in the checkout/order
 * flow ever calls this, so a logo already attached to a placed order is
 * never at risk from it.
 *
 * `path` is validated against the same strict generated-path pattern the
 * upload route produces before being passed to Storage, so this can never
 * be used to delete an arbitrary object elsewhere in the bucket (or
 * outside it) — the bucket itself is never client-supplied.
 */
export async function DELETE(request: NextRequest) {
  let body: DeleteRequestBody;
  try {
    body = await request.json();
  } catch {
    return badRequest("Malformed request body.");
  }

  if (typeof body.path !== "string" || !isValidLogoPath(body.path)) {
    return badRequest("Invalid logo reference.");
  }

  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    console.error("Multi-Link logo delete: Supabase is not configured:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Unable to process this right now." }, { status: 503 });
  }

  const { error: deleteError } = await supabase.storage.from(MULTI_LINK_LOGO_BUCKET).remove([body.path]);

  if (deleteError) {
    // Non-fatal from the caller's point of view (see MultiLinkConfiguration —
    // a failed cleanup delete never blocks the customer's own flow), but
    // still worth a clear response so the client can decide whether to log it.
    console.error("Multi-Link logo delete failed:", deleteError.message);
    return NextResponse.json({ error: "Could not remove the previous logo." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
