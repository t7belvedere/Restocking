-- =============================================
-- Migration 004 — Queue de scrape
-- Permet au frontend de demander un scrape via le worker
-- =============================================

create table if not exists scrape_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade not null,
  url           text not null,
  status        text default 'pending' check (status in ('pending', 'processing', 'done', 'failed')),
  name          text,
  image_url     text,
  price         numeric,
  variants      jsonb default '[]'::jsonb,
  error         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists scrape_requests_status_idx on scrape_requests(status) where status in ('pending', 'processing');

-- RLS : chaque utilisateur ne voit que ses propres requêtes
alter table scrape_requests enable row level security;

create policy "scrape_requests_select_own" on scrape_requests
  for select using (auth.uid() = user_id);

create policy "scrape_requests_insert_own" on scrape_requests
  for insert with check (auth.uid() = user_id);
