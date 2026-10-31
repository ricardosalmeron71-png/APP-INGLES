-- =========================================================
-- EnglishUp — base de datos en Supabase
-- Cómo usarlo: Supabase → SQL Editor → New query → pega TODO este archivo → Run.
-- Se puede ejecutar más de una vez sin problema.
-- =========================================================

-- Perfil público (lo que ven tus amigos y el ranking)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  friend_code text unique not null default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)),
  name text not null default '',
  avatar text not null default '🦉',
  is_public boolean not null default true,
  summary jsonb not null default '{}'::jsonb,
  xp integer not null default 0,
  week_xp integer not null default 0,
  level text not null default 'A1',
  cefr text not null default 'A0',
  streak integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Datos completos de progreso (privados: solo el dueño)
create table if not exists public.user_data (
  id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Amistades (se crean en ambos sentidos con add_friend)
create table if not exists public.friends (
  user_id uuid not null references auth.users on delete cascade,
  friend_id uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);

-- Contador de uso del tutor IA (para limitar el gasto)
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users on delete cascade,
  day date not null default current_date,
  count integer not null default 0,
  primary key (user_id, day)
);

alter table public.profiles enable row level security;
alter table public.user_data enable row level security;
alter table public.friends enable row level security;
alter table public.ai_usage enable row level security;

-- ---------- Permisos ----------
revoke all on public.profiles, public.user_data, public.friends, public.ai_usage from anon;
revoke update on public.profiles from authenticated;
-- El usuario puede cambiar estas columnas de su perfil (no su código de amigo ni su id)
grant update (name, avatar, is_public, summary, xp, week_xp, level, cefr, streak, updated_at) on public.profiles to authenticated;
revoke all on public.ai_usage from authenticated;

drop policy if exists "perfiles visibles" on public.profiles;
create policy "perfiles visibles" on public.profiles for select to authenticated using (
  is_public or id = auth.uid()
  or exists (select 1 from public.friends f where f.user_id = auth.uid() and f.friend_id = profiles.id)
);
drop policy if exists "crear mi perfil" on public.profiles;
create policy "crear mi perfil" on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists "editar mi perfil" on public.profiles;
create policy "editar mi perfil" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "mis datos" on public.user_data;
create policy "mis datos" on public.user_data for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "ver mis amigos" on public.friends;
create policy "ver mis amigos" on public.friends for select to authenticated using (user_id = auth.uid());
drop policy if exists "quitar amigos" on public.friends;
create policy "quitar amigos" on public.friends for delete to authenticated using (user_id = auth.uid() or friend_id = auth.uid());

-- ---------- Crear el perfil automáticamente al registrarse ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(left(new.raw_user_meta_data ->> 'name', 40), ''))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Agregar amigo por código (amistad mutua) ----------
create or replace function public.add_friend(code text) returns json
language plpgsql security definer set search_path = public as $$
declare fid uuid;
begin
  if auth.uid() is null then raise exception 'Inicia sesión primero'; end if;
  select id into fid from public.profiles where friend_code = upper(trim(code));
  if fid is null then raise exception 'No existe ningún usuario con ese código'; end if;
  if fid = auth.uid() then raise exception 'Ese es tu propio código'; end if;
  insert into public.friends (user_id, friend_id) values (auth.uid(), fid) on conflict do nothing;
  insert into public.friends (user_id, friend_id) values (fid, auth.uid()) on conflict do nothing;
  return (select row_to_json(p) from public.profiles p where p.id = fid);
end $$;
revoke all on function public.add_friend(text) from public, anon;
grant execute on function public.add_friend(text) to authenticated;

-- ---------- Quitar amigo (en ambos sentidos) ----------
create or replace function public.remove_friend(fid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from public.friends where (user_id = auth.uid() and friend_id = fid) or (user_id = fid and friend_id = auth.uid());
end $$;
revoke all on function public.remove_friend(uuid) from public, anon;
grant execute on function public.remove_friend(uuid) to authenticated;

-- ---------- Límite diario del tutor IA (solo lo usa el servidor) ----------
create or replace function public.bump_ai_usage(p_user uuid, p_limit integer) returns integer
language plpgsql security definer set search_path = public as $$
declare c integer;
begin
  insert into public.ai_usage (user_id, day, count) values (p_user, current_date, 1)
  on conflict (user_id, day) do update set count = public.ai_usage.count + 1
  returning count into c;
  if c > p_limit then return -1; end if;
  return p_limit - c;
end $$;
revoke all on function public.bump_ai_usage(uuid, integer) from public, anon, authenticated;
grant execute on function public.bump_ai_usage(uuid, integer) to service_role;
