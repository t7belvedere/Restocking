-- =============================================
-- Migration pour la Waitlist (Ajout)
-- =============================================

create table if not exists waitlist (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  locale        text default 'fr',
  source        text,
  referrer      text,
  created_at    timestamptz default now()
);

-- Row Level Security (RLS)
alter table waitlist enable row level security;

-- Permettre l'insertion publique (formulaire waitlist)
create policy "waitlist_insert" on waitlist
  for insert with check (true);

-- Permettre la lecture publique (pour le compteur live)
create policy "waitlist_select" on waitlist
  for select using (true);
