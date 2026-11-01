-- =========================================================
-- EnglishUp — Recordatorios y notificaciones push
-- Cómo usarlo: Supabase → SQL Editor → New query → pega TODO este archivo → Run.
-- Se puede ejecutar más de una vez sin problema.
-- =========================================================

-- Configuración del servidor (llaves de notificación y clave del cron). Nadie desde la app puede leerla.
create table if not exists public.push_config (
  id int primary key default 1 check (id = 1),
  vapid jsonb,
  cron_token text not null default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  function_slug text not null default 'reminders'
);
insert into public.push_config (id) values (1) on conflict do nothing;
alter table public.push_config enable row level security;
revoke all on public.push_config from anon, authenticated;

-- Dispositivos que quieren recordatorios
create table if not exists public.push_subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  tz text not null default 'UTC',
  hour smallint not null default 19 check (hour between 0 and 23),
  minute smallint not null default 0 check (minute between 0 and 59),
  days smallint[] not null default '{0,1,2,3,4,5,6}',
  streak_alert boolean not null default true,
  enabled boolean not null default true,
  name text not null default '',
  streak integer not null default 0,
  last_practice date,
  last_sent date,
  last_alert date,
  test_at timestamptz,
  fail_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;
grant select, delete on public.push_subscriptions to authenticated;
-- La app solo actualiza su actividad y sus preferencias (la función del servidor hace el resto)
grant update (tz, hour, minute, days, streak_alert, enabled, name, streak, last_practice) on public.push_subscriptions to authenticated;

drop policy if exists "ver mis dispositivos" on public.push_subscriptions;
create policy "ver mis dispositivos" on public.push_subscriptions for select to authenticated using (user_id = auth.uid());
drop policy if exists "actualizar mis dispositivos" on public.push_subscriptions;
create policy "actualizar mis dispositivos" on public.push_subscriptions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "borrar mis dispositivos" on public.push_subscriptions;
create policy "borrar mis dispositivos" on public.push_subscriptions for delete to authenticated using (user_id = auth.uid());

-- Revisión automática cada 15 minutos (envía los recordatorios que toquen)
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.unschedule(jobid) from cron.job where jobname = 'englishup-reminders';
select cron.schedule(
  'englishup-reminders',
  '*/15 * * * *',
  $job$
  select net.http_post(
    url := 'https://bwdkfahrgvqfqxryjfll.supabase.co/functions/v1/' || (select function_slug from public.push_config where id = 1),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-token', (select cron_token from public.push_config where id = 1)),
    body := jsonb_build_object('action', 'cron'),
    timeout_milliseconds := 30000
  );
  $job$
);
