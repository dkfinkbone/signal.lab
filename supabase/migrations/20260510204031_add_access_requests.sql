create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  email text not null unique,
  company text not null default '',
  role text not null default '',
  source_path text not null default '/join',
  invite_token text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'invited', 'rejected')),
  notes text not null default ''
);

create index if not exists access_requests_created_at_idx
  on public.access_requests (created_at desc);

create index if not exists access_requests_status_idx
  on public.access_requests (status);

alter table public.access_requests enable row level security;
