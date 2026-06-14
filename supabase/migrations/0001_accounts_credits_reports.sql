-- 易解账户、积分、AI 报告与风控表
-- 适用于 Supabase PostgreSQL。上线前先在 Supabase SQL Editor 或迁移流程中执行。

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('grant', 'purchase', 'consume', 'refund', 'adjust')),
  amount integer not null,
  balance_after integer not null check (balance_after >= 0),
  reason text not null,
  idempotency_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists credit_ledger_idempotency_key_idx
  on public.credit_ledger (idempotency_key)
  where idempotency_key is not null;

create index if not exists credit_ledger_user_created_idx
  on public.credit_ledger (user_id, created_at desc);

create table if not exists public.ai_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  domain text not null check (domain in ('liuyao', 'bazi', 'ziwei', 'combined')),
  title text not null,
  question text,
  style text not null default 'plain',
  depth text not null default 'brief',
  provider text not null default 'deepseek',
  model text,
  cost integer not null default 0,
  content text not null,
  chart jsonb not null default '{}'::jsonb,
  usage jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_reports_user_created_idx
  on public.ai_reports (user_id, created_at desc);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  provider_order_id text,
  status text not null check (status in ('pending', 'paid', 'closed', 'refunded')),
  credits integer not null check (credits > 0),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'CNY',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create unique index if not exists orders_provider_order_id_idx
  on public.orders (provider, provider_order_id)
  where provider_order_id is not null;

create table if not exists public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  ip inet,
  route text not null,
  event_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_key_created_idx
  on public.rate_limit_events (event_key, created_at desc);

alter table public.profiles enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.ai_reports enable row level security;
alter table public.orders enable row level security;
alter table public.rate_limit_events enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "credit_ledger_select_own" on public.credit_ledger;
create policy "credit_ledger_select_own"
  on public.credit_ledger for select
  using (auth.uid() = user_id);

drop policy if exists "ai_reports_select_own" on public.ai_reports;
create policy "ai_reports_select_own"
  on public.ai_reports for select
  using (auth.uid() = user_id);

drop policy if exists "ai_reports_delete_own" on public.ai_reports;
create policy "ai_reports_delete_own"
  on public.ai_reports for delete
  using (auth.uid() = user_id);

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = user_id);

-- credit_ledger、orders、rate_limit_events、ai_reports 的服务端写入应使用 service role。
-- 前端只允许读取自己的记录，避免用户伪造积分或报告成本。
