-- =============================================
-- Migration 001 — Schéma initial Restocking
-- Région cible : EU Frankfurt (conformité RGPD)
-- =============================================

-- Produits surveillés
create table if not exists watches (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users not null,
  url           text not null,
  name          text,
  image_url     text,
  price         numeric,
  -- Variante sélectionnée par l'utilisateur
  variant_label text,           -- ex : "Taille S / Bleu marine"
  variant_id    text,           -- identifiant technique côté retailer
  -- Statut
  last_status   text default 'UNKNOWN' check (last_status in ('IN_STOCK', 'OUT_OF_STOCK', 'UNKNOWN')),
  last_check    timestamptz,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

-- Historique des checks
create table if not exists check_logs (
  id            uuid primary key default gen_random_uuid(),
  watch_id      uuid references watches on delete cascade not null,
  status        text not null check (status in ('IN_STOCK', 'OUT_OF_STOCK', 'UNKNOWN')),
  price         numeric,
  signal_source text check (signal_source in ('dataLayer', 'add_to_cart_btn', 'variant_attr', 'playwright')),
  raw_signal    text,
  checked_at    timestamptz default now()
);

-- Notifications envoyées
create table if not exists notifications (
  id            uuid primary key default gen_random_uuid(),
  watch_id      uuid references watches on delete cascade not null,
  channel       text not null check (channel in ('email', 'sms')),
  sent_at       timestamptz default now(),
  success       boolean default true
);

-- Plans utilisateurs (miroir Stripe)
create table if not exists subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users not null unique,
  plan                text default 'free' check (plan in ('free', 'pro')),
  stripe_sub_id       text,
  current_period_end  timestamptz,
  updated_at          timestamptz default now()
);

-- =============================================
-- Index de performance
-- =============================================
create index if not exists watches_user_id_idx on watches(user_id);
create index if not exists watches_is_active_idx on watches(is_active) where is_active = true;
create index if not exists check_logs_watch_id_idx on check_logs(watch_id);
create index if not exists check_logs_checked_at_idx on check_logs(checked_at desc);
create index if not exists subscriptions_user_id_idx on subscriptions(user_id);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
alter table watches enable row level security;
alter table check_logs enable row level security;
alter table notifications enable row level security;
alter table subscriptions enable row level security;

-- Watches : chaque utilisateur ne voit et ne modifie que ses propres watches
create policy "watches_select_own" on watches
  for select using (auth.uid() = user_id);

create policy "watches_insert_own" on watches
  for insert with check (auth.uid() = user_id);

create policy "watches_update_own" on watches
  for update using (auth.uid() = user_id);

create policy "watches_delete_own" on watches
  for delete using (auth.uid() = user_id);

-- Check logs : lecture seule, via les watches de l'utilisateur
create policy "check_logs_select_own" on check_logs
  for select using (
    watch_id in (select id from watches where user_id = auth.uid())
  );

-- Notifications : lecture seule, via les watches de l'utilisateur
create policy "notifications_select_own" on notifications
  for select using (
    watch_id in (select id from watches where user_id = auth.uid())
  );

-- Subscriptions : chaque utilisateur voit uniquement la sienne
create policy "subscriptions_select_own" on subscriptions
  for select using (auth.uid() = user_id);

create policy "subscriptions_insert_own" on subscriptions
  for insert with check (auth.uid() = user_id);

create policy "subscriptions_update_own" on subscriptions
  for update using (auth.uid() = user_id);

-- =============================================
-- Trigger : créer automatiquement une subscription Free au signup
-- =============================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, plan)
  values (new.id, 'free');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
