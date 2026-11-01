-- =========================================================
-- EnglishUp — Temas del tutor compartidos entre todos los usuarios
-- Cómo usarlo: Supabase → SQL Editor → New query → pega TODO este archivo → Run.
-- Se puede ejecutar más de una vez sin problema.
-- =========================================================

create table if not exists public.tutor_topics (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null check (char_length(title) between 3 and 80),
  author text not null default '',
  uses integer not null default 0,
  created_at timestamptz not null default now()
);
-- No se repiten temas (sin importar mayúsculas)
create unique index if not exists tutor_topics_title_uq on public.tutor_topics (lower(title));

alter table public.tutor_topics enable row level security;
revoke all on public.tutor_topics from anon;
revoke all on public.tutor_topics from authenticated;
grant select on public.tutor_topics to authenticated;
grant insert (user_id, title) on public.tutor_topics to authenticated;
grant delete on public.tutor_topics to authenticated;

drop policy if exists "ver temas" on public.tutor_topics;
create policy "ver temas" on public.tutor_topics for select to authenticated using (true);
drop policy if exists "crear mis temas" on public.tutor_topics;
create policy "crear mis temas" on public.tutor_topics for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "borrar mis temas" on public.tutor_topics;
create policy "borrar mis temas" on public.tutor_topics for delete to authenticated using (user_id = auth.uid());

-- Limpia el título, pone el nombre del autor y limita a 10 temas nuevos por día por usuario
create or replace function public.tutor_topics_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.title := regexp_replace(btrim(new.title), '\s+', ' ', 'g');
  if char_length(new.title) < 3 then raise exception 'El tema es demasiado corto'; end if;
  if (select count(*) from public.tutor_topics where user_id = new.user_id and created_at > now() - interval '1 day') >= 10 then
    raise exception 'Llegaste al límite de 10 temas nuevos por día. Vuelve mañana.';
  end if;
  new.author := coalesce((select left(name, 40) from public.profiles where id = new.user_id), '');
  new.uses := 0;
  return new;
end $$;
drop trigger if exists tutor_topics_bi on public.tutor_topics;
create trigger tutor_topics_bi before insert on public.tutor_topics
  for each row execute function public.tutor_topics_before_insert();

-- Cuenta cuántas veces se usa un tema (para mostrar los más populares primero)
create or replace function public.use_topic(tid bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Inicia sesión primero'; end if;
  update public.tutor_topics set uses = uses + 1 where id = tid;
end $$;
revoke all on function public.use_topic(bigint) from public, anon;
grant execute on function public.use_topic(bigint) to authenticated;
