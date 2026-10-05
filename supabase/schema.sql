-- Run this once in Supabase Dashboard > SQL Editor.
create table if not exists public.users (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  uid text not null references public.users(id) on delete cascade,
  perusahaan text not null default '',
  posisi text not null default '',
  email text not null default '',
  subjek text not null default '',
  status text not null default 'sent',
  sent_at timestamptz not null default now(),
  cv_path text not null default '',
  error text
);

create index if not exists applications_uid_sent_at_idx on public.applications(uid, sent_at desc);
alter table public.users enable row level security;
alter table public.applications enable row level security;

-- The app authenticates with Firebase and accesses Supabase only from trusted
-- Next.js server routes using SUPABASE_SERVICE_ROLE_KEY.
