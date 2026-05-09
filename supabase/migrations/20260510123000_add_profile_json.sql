-- Prerequisite:
--   public.members must already exist before this migration is applied.
--   The current branch does not yet include the earlier onboarding schema
--   migrations that create members/accounts/member_domains/orgs.

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS profile_json jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS members_profile_slug_idx
  ON public.members(profile_slug);

CREATE TABLE IF NOT EXISTS public.member_vendors (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   uuid REFERENCES public.members(id) ON DELETE CASCADE,
  vendor_slug text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(member_id, vendor_slug)
);
