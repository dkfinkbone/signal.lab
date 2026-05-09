create extension if not exists pgcrypto;

create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org_slug text not null unique,
  org_domain text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  company text,
  role text,
  org_domain text,
  org_id uuid references public.orgs(id) on delete set null,
  profile_slug text unique,
  invite_token text,
  profile_score integer not null default 0,
  member_role text not null default 'contributor',
  linkedin_url text,
  telegram text,
  whatsapp text,
  profile_json jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  sector text not null,
  region text not null,
  relationship text not null,
  deal_band text,
  created_at timestamptz not null default now()
);

create table if not exists public.member_domains (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  domain_slug text not null,
  created_at timestamptz not null default now(),
  unique(member_id, domain_slug)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'members_profile_score_range_check'
      and conrelid = 'public.members'::regclass
  ) then
    alter table public.members
      add constraint members_profile_score_range_check
      check (profile_score between 0 and 100);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'members_member_role_check'
      and conrelid = 'public.members'::regclass
  ) then
    alter table public.members
      add constraint members_member_role_check
      check (member_role in ('contributor', 'senior_member', 'org_admin', 'platform_admin'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'accounts_sector_check'
      and conrelid = 'public.accounts'::regclass
  ) then
    alter table public.accounts
      add constraint accounts_sector_check
      check (
        sector in (
          'financial-services',
          'healthcare',
          'public-sector',
          'retail',
          'manufacturing',
          'energy',
          'legal',
          'education',
          'technology',
          'telecoms'
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'accounts_region_check'
      and conrelid = 'public.accounts'::regclass
  ) then
    alter table public.accounts
      add constraint accounts_region_check
      check (region in ('uk', 'emea', 'apac', 'americas', 'global'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'accounts_relationship_check'
      and conrelid = 'public.accounts'::regclass
  ) then
    alter table public.accounts
      add constraint accounts_relationship_check
      check (relationship in ('active-pipeline', 'existing-customer', 'lapsed'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'accounts_deal_band_check'
      and conrelid = 'public.accounts'::regclass
  ) then
    alter table public.accounts
      add constraint accounts_deal_band_check
      check (deal_band is null or deal_band in ('<50k', '50k-250k', '250k-1m', '1m+'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'member_domains_domain_slug_check'
      and conrelid = 'public.member_domains'::regclass
  ) then
    alter table public.member_domains
      add constraint member_domains_domain_slug_check
      check (
        domain_slug in (
          'microsegmentation',
          'zero-trust',
          'sase-sd-wan',
          'cloud-security',
          'edr-endpoint',
          'firewalls-network',
          'ot-ics',
          'iam',
          'siem-soc',
          'data-security',
          'grc-compliance',
          'managed-services',
          'cloud-infra',
          'ucc'
        )
      );
  end if;
end $$;

create index if not exists members_org_domain_idx on public.members (org_domain);
create index if not exists members_org_id_idx on public.members (org_id);
create index if not exists members_profile_slug_idx on public.members (profile_slug);
create index if not exists accounts_member_id_idx on public.accounts (member_id);
create index if not exists member_domains_member_id_idx on public.member_domains (member_id);
create index if not exists member_domains_domain_slug_idx on public.member_domains (domain_slug);

alter table public.orgs enable row level security;
alter table public.members enable row level security;
alter table public.accounts enable row level security;
alter table public.member_domains enable row level security;

drop trigger if exists set_orgs_updated_at on public.orgs;
create trigger set_orgs_updated_at
before update on public.orgs
for each row
execute function public.set_row_updated_at();

drop trigger if exists set_members_updated_at on public.members;
create trigger set_members_updated_at
before update on public.members
for each row
execute function public.set_row_updated_at();
