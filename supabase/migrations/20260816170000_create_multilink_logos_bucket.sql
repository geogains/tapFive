-- Multi-Link Card business-logo storage bucket.
--
-- This migration is NOT yet applied to any live Supabase project — same
-- status as 20260810120000_create_orders_schema.sql until someone runs it
-- against the real project (Supabase CLI `db push`, or pasted into the
-- Dashboard SQL editor).
--
-- Private bucket: these are order assets (a customer's uploaded business
-- logo), not general public files, and there is no established
-- public-bucket convention elsewhere in this project to justify making it
-- public. All access goes through the Supabase service-role key from
-- server-side code only:
--   - upload: src/app/api/multi-link/logo/route.ts (POST)
--   - delete (pre-checkout replace/remove only, never after an order is
--     placed): src/app/api/multi-link/logo/route.ts (DELETE)
--   - future read access for fulfilment: signed URLs generated
--     server-side on demand, never a permanent public URL
--
-- Row Level Security on storage.objects is enabled and enforced by
-- Supabase itself for every bucket; no policies are added here for the
-- anon/authenticated roles, so — same default-deny posture as
-- public.orders/public.order_items in the previous migration — the
-- browser can never list, read, overwrite, or delete objects in this
-- bucket directly. Object paths are also server-generated
-- (`<uuid>/logo.<ext>`, see src/lib/multiLinkLogo.ts), so even if a policy
-- existed, paths are not guessable/enumerable.
insert into storage.buckets (id, name, public)
values ('multilink-logos', 'multilink-logos', false)
on conflict (id) do nothing;
