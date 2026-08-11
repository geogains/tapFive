-- Tap Five contact form data model.
--
-- Backs the public contact form (src/components/forms/ContactForm.tsx) via
-- POST /api/contact (src/app/api/contact/route.ts). All server-validated —
-- the browser only ever submits name/email/business/phone/subject/message;
-- `status`, `id`, `created_at` and `updated_at` are never client-supplied.
--
-- Same posture as supabase/migrations/20260810120000_create_orders_schema.sql
-- (not modified by this migration): RLS enabled, no anon/authenticated
-- policies — every read/write goes through server-side code using the
-- Supabase service-role key, which bypasses RLS. The browser must never be
-- able to list, read, modify or delete a submission, or insert one directly
-- without going through the validated API route.
--
-- This Supabase project was created with automatic table exposure/
-- privileges disabled, so — as with the orders tables — service_role needs
-- an explicit grant to this table; anon/authenticated intentionally get
-- none.

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  email text not null,

  -- The existing contact form also collects an optional business name and
  -- phone number (see ContactForm.tsx) — captured here rather than
  -- discarded, since it's real information a real customer submitted.
  business_name text,
  phone text,

  -- Nullable: the current form UI doesn't ask for a subject, but the API
  -- accepts one if a future entry point supplies it.
  subject text,
  message text not null,

  -- `new`      — just submitted, not yet looked at.
  -- `read`     — someone at Tap Five has seen it.
  -- `replied`  — a reply has been sent.
  -- `archived` — no further action needed; kept for record only.
  status text not null default 'new'
    check (status in ('new', 'read', 'replied', 'archived')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Supports the natural "unread/unactioned submissions first" admin view.
create index if not exists contact_submissions_status_idx on public.contact_submissions (status);
-- Supports listing submissions in chronological order (newest first).
create index if not exists contact_submissions_created_at_idx on public.contact_submissions (created_at desc);

alter table public.contact_submissions enable row level security;
-- No policies defined here on purpose — default-deny for anon/authenticated
-- roles, identical posture to orders/order_items. Server-side code must use
-- the Supabase service-role key (never exposed to the client) for all
-- access to this table.

grant usage on schema public to service_role;
grant select, insert, update, delete on public.contact_submissions to service_role;
-- Deliberately no grants to anon or authenticated — the browser must never
-- have a direct database credential path to this table.
