alter table subscriptions
  add column if not exists stripe_customer_id text;

create index if not exists subscriptions_stripe_customer_id_idx
  on subscriptions(stripe_customer_id);
