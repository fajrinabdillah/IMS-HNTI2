-- IMS HNTI Push Notifications
-- Jalankan SELURUH file ini di Supabase SQL Editor (bukan hanya GRANT saja).

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  role text not null,
  endpoint text not null unique,
  subscription jsonb not null,
  user_agent text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_username
  on public.push_subscriptions (username)
  where active = true;

create index if not exists idx_push_subscriptions_role
  on public.push_subscriptions (role)
  where active = true;

alter table public.push_subscriptions enable row level security;

-- WAJIB: policy RLS (tanpa ini → save_failed / row-level security violation)
drop policy if exists "push_subscriptions_insert" on public.push_subscriptions;
create policy "push_subscriptions_insert"
on public.push_subscriptions for insert to anon, authenticated with check (true);

drop policy if exists "push_subscriptions_update" on public.push_subscriptions;
create policy "push_subscriptions_update"
on public.push_subscriptions for update to anon, authenticated using (true) with check (true);

drop policy if exists "push_subscriptions_select" on public.push_subscriptions;
create policy "push_subscriptions_select"
on public.push_subscriptions for select to anon, authenticated using (true);

-- WAJIB: GRANT (tanpa ini → permission denied)
grant select, insert, update on public.push_subscriptions to anon, authenticated;
grant all on public.push_subscriptions to service_role;

notify pgrst, 'reload schema';
