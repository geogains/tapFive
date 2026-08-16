-- Tap Five order data model — Phase 1 (schema only).
--
-- This migration is NOT yet connected to any live Supabase project or to
-- any application code. It exists so the eventual checkout flow has
-- somewhere durable to write to:
--
--   pending order created server-side (see src/lib/server/orderPricing.ts,
--   src/lib/server/orderConfiguration.ts)
--     -> Stripe Checkout Session created, internal order id passed via
--        session metadata
--     -> customer pays
--     -> verified Stripe webhook (checkout.session.completed) marks the
--        order `paid`
--     -> Tap Five is notified
--
-- Money is stored as integer minor units (pence), never floating point —
-- e.g. £40.00 -> 4000 — mirroring how src/data/pricing.ts already works
-- client-side.
--
-- Row Level Security is enabled on both tables with NO policies for the
-- anon/authenticated roles. That is intentional, not an oversight: every
-- read/write to these tables must go through server-side code using the
-- Supabase service-role key, which bypasses RLS entirely. The browser must
-- never be able to create, read, or modify order rows directly — it must
-- never be able to mark an order paid, set an arbitrary price, or touch
-- another customer's order.

create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),

  -- `pending`  — created when checkout starts; NOT a confirmed sale.
  -- `paid`     — set ONLY by a verified Stripe webhook (Phase 2).
  -- `payment_failed` / `cancelled` — Stripe reported the session didn't
  --   complete; kept distinct from `pending` so stale/abandoned attempts
  --   are easy to filter out of anything that looks like a real order.
  -- `fulfilled` — Tap Five has produced/dispatched the order. Set manually
  --   for now; not required immediately.
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'payment_failed', 'cancelled', 'fulfilled')),

  -- Populated once Stripe is connected (Phase 2). Nullable until then.
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,

  customer_email text,
  customer_name text,

  currency text not null default 'gbp',

  -- Minor units (pence). Always server-calculated — see
  -- src/lib/server/orderPricing.ts. A client-submitted total must never be
  -- written here directly.
  subtotal integer not null check (subtotal >= 0),
  total integer not null check (total >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_stripe_checkout_session_id_idx
  on public.orders (stripe_checkout_session_id);

alter table public.orders enable row level security;
-- No policies defined here on purpose — default-deny for anon/authenticated
-- roles. Server-side code must use the Supabase service-role key (never
-- exposed to the client) for all access to this table.


create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,

  -- Matches `Product.slug` in src/data/products.ts.
  product_slug text not null,
  -- Snapshot of the product name at order time, so a later product-name
  -- change on the site doesn't rewrite historical orders.
  product_name text not null,

  quantity integer not null check (quantity > 0),

  -- Minor units (pence) — snapshots of the pricing tier that applied at
  -- order time, recalculated server-side via src/lib/server/orderPricing.ts
  -- (never taken from the client's cart state).
  unit_price integer not null check (unit_price >= 0),
  line_total integer not null check (line_total >= 0),

  -- Customer-submitted configuration (Instagram handle, Google business
  -- details, custom branding info, etc.), re-validated server-side via
  -- src/lib/server/orderConfiguration.ts before being written here.
  --
  -- File uploads (e.g. the Multi-Link Card's business logo — see
  -- 20260816170000_create_multilink_logos_bucket.sql and
  -- src/lib/multiLinkLogo.ts) are stored in Supabase Storage and referenced
  -- here as a {bucket, path, originalName, mimeType} object under flat
  -- `multiLinkLogo*` keys — never a signed/expiring URL as the permanent
  -- reference, and never file bytes in this jsonb column.
  configuration jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;
-- Same default-deny posture as `orders` above — service-role key only.
