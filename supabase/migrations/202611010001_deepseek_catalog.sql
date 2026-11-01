-- Apply in Supabase SQL Editor as the project owner. No credentials belong here.
-- The admin list is deliberately outside the API-exposed public schema.
begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
revoke all on private.admin_users from public, anon, authenticated;
alter table private.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from private.admin_users where user_id = (select auth.uid())); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.prompt_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists prompt_categories_name_unique on public.prompt_categories (lower(btrim(name)));

create table if not exists public.deepseek_prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  category_id uuid not null references public.prompt_categories(id) on delete restrict,
  description text not null check (char_length(btrim(description)) between 1 and 500),
  content text not null check (char_length(btrim(content)) between 1 and 30000),
  cover_path text check (cover_path is null or cover_path ~ '^covers/[0-9a-f-]{36}\.(jpg|png|webp)$'),
  tags text[] not null default '{}' check (cardinality(tags) <= 12 and char_length(array_to_string(tags, ',')) <= 491),
  published boolean not null default false,
  sort_order integer not null check (sort_order >= 0),
  published_at timestamptz,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists deepseek_prompts_cover_unique on public.deepseek_prompts (cover_path) where cover_path is not null;
create index if not exists deepseek_prompts_public_order on public.deepseek_prompts (sort_order, created_at) where published;
create index if not exists deepseek_prompts_category on public.deepseek_prompts (category_id);

create or replace function public.catalog_metadata()
returns trigger language plpgsql set search_path = '' as $$
begin
  if TG_OP = 'INSERT' and NEW.sort_order is null then
    if TG_TABLE_NAME = 'deepseek_prompts' then
      select coalesce(max(sort_order) + 1, 0) into NEW.sort_order from public.deepseek_prompts;
    else
      select coalesce(max(sort_order) + 1, 0) into NEW.sort_order from public.prompt_categories;
    end if;
  end if;
  NEW.updated_at := clock_timestamp();
  if TG_TABLE_NAME = 'deepseek_prompts' then
    if NEW.published then
      if TG_OP = 'INSERT' then NEW.published_at := now();
      elsif not OLD.published then NEW.published_at := now();
      else NEW.published_at := OLD.published_at;
      end if;
    else NEW.published_at := null;
    end if;
  end if;
  return NEW;
end; $$;
revoke all on function public.catalog_metadata() from public, anon, authenticated;
drop trigger if exists catalog_category_metadata on public.prompt_categories;
create trigger catalog_category_metadata before insert or update on public.prompt_categories for each row execute function public.catalog_metadata();
drop trigger if exists catalog_prompt_metadata on public.deepseek_prompts;
create trigger catalog_prompt_metadata before insert or update on public.deepseek_prompts for each row execute function public.catalog_metadata();

alter table public.prompt_categories enable row level security;
alter table public.deepseek_prompts enable row level security;
revoke all on public.prompt_categories, public.deepseek_prompts from public, anon, authenticated;
grant select on public.prompt_categories, public.deepseek_prompts to anon, authenticated;
grant insert, update, delete on public.prompt_categories, public.deepseek_prompts to authenticated;

drop policy if exists categories_read on public.prompt_categories;
create policy categories_read on public.prompt_categories for select to anon, authenticated using (true);
drop policy if exists categories_admin_insert on public.prompt_categories;
create policy categories_admin_insert on public.prompt_categories for insert to authenticated with check ((select public.is_admin()));
drop policy if exists categories_admin_update on public.prompt_categories;
create policy categories_admin_update on public.prompt_categories for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists categories_admin_delete on public.prompt_categories;
create policy categories_admin_delete on public.prompt_categories for delete to authenticated using ((select public.is_admin()));

drop policy if exists prompts_read on public.deepseek_prompts;
create policy prompts_read on public.deepseek_prompts for select to anon, authenticated using (published or (select public.is_admin()));
drop policy if exists prompts_admin_insert on public.deepseek_prompts;
create policy prompts_admin_insert on public.deepseek_prompts for insert to authenticated with check ((select public.is_admin()));
drop policy if exists prompts_admin_update on public.deepseek_prompts;
create policy prompts_admin_update on public.deepseek_prompts for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists prompts_admin_delete on public.deepseek_prompts;
create policy prompts_admin_delete on public.deepseek_prompts for delete to authenticated using ((select public.is_admin()));

-- Reordering is atomic. The caller's JWT and table RLS apply inside each function.
create or replace function public.admin_reorder_prompts(p_ids uuid[])
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not (select public.is_admin()) then raise exception 'Administrator required' using errcode = '42501'; end if;
  if cardinality(p_ids) is null or cardinality(p_ids) = 0 or cardinality(p_ids) > 10000 then raise exception 'Invalid order' using errcode = '22023'; end if;
  if (select count(distinct id) from unnest(p_ids) as ids(id)) <> cardinality(p_ids)
     or (select count(*) from public.deepseek_prompts where id = any(p_ids)) <> cardinality(p_ids)
  then raise exception 'Order contains missing or duplicate ids' using errcode = '22023'; end if;
  update public.deepseek_prompts as p set sort_order = (ids.position - 1)::integer
    from unnest(p_ids) with ordinality as ids(id, position) where p.id = ids.id;
end; $$;
revoke all on function public.admin_reorder_prompts(uuid[]) from public, anon;
grant execute on function public.admin_reorder_prompts(uuid[]) to authenticated;

create or replace function public.admin_reorder_categories(p_ids uuid[])
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not (select public.is_admin()) then raise exception 'Administrator required' using errcode = '42501'; end if;
  if cardinality(p_ids) is null or cardinality(p_ids) = 0 or cardinality(p_ids) > 10000 then raise exception 'Invalid order' using errcode = '22023'; end if;
  if (select count(distinct id) from unnest(p_ids) as ids(id)) <> cardinality(p_ids)
     or (select count(*) from public.prompt_categories where id = any(p_ids)) <> cardinality(p_ids)
  then raise exception 'Order contains missing or duplicate ids' using errcode = '22023'; end if;
  update public.prompt_categories as c set sort_order = (ids.position - 1)::integer
    from unnest(p_ids) with ordinality as ids(id, position) where c.id = ids.id;
end; $$;
revoke all on function public.admin_reorder_categories(uuid[]) from public, anon;
grant execute on function public.admin_reorder_categories(uuid[]) to authenticated;

-- Private image bucket. Anonymous users may sign/read only published covers.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('deepseek-covers', 'deepseek-covers', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists deepseek_covers_read on storage.objects;
create policy deepseek_covers_read on storage.objects for select to anon, authenticated using (
  bucket_id = 'deepseek-covers' and (
    (select public.is_admin()) or exists (
      select 1 from public.deepseek_prompts as p where p.published and p.cover_path = storage.objects.name
    )
  )
);
drop policy if exists deepseek_covers_insert on storage.objects;
create policy deepseek_covers_insert on storage.objects for insert to authenticated with check (bucket_id = 'deepseek-covers' and (select public.is_admin()));
drop policy if exists deepseek_covers_update on storage.objects;
create policy deepseek_covers_update on storage.objects for update to authenticated using (bucket_id = 'deepseek-covers' and (select public.is_admin())) with check (bucket_id = 'deepseek-covers' and (select public.is_admin()));
drop policy if exists deepseek_covers_delete on storage.objects;
create policy deepseek_covers_delete on storage.objects for delete to authenticated using (bucket_id = 'deepseek-covers' and (select public.is_admin()));

commit;
