-- =============================================
-- Migration 003 — Ajout de ON DELETE CASCADE
-- Permet de supprimer un utilisateur sans erreur de contrainte de clé étrangère
-- =============================================

alter table public.watches
  drop constraint if exists watches_user_id_fkey,
  add constraint watches_user_id_fkey 
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.subscriptions
  drop constraint if exists subscriptions_user_id_fkey,
  add constraint subscriptions_user_id_fkey 
  foreign key (user_id) references auth.users(id) on delete cascade;
