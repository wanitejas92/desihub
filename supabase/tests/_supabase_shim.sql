-- Minimal Supabase platform shim so the real migrations apply unchanged
-- against a plain Postgres, with no Supabase project and no network.
--
-- Only what the migrations actually touch: the `auth` schema and `auth.uid()`
-- (which every RLS policy is written against), a `storage` stub for the
-- bucket policies, and the three PostgREST roles. `auth.uid()` reads the same
-- `request.jwt.claim.sub` setting Supabase populates per request, so a test
-- becomes anonymous or signed-in by setting it — exactly as production does.
create extension if not exists "pgcrypto";

create schema if not exists auth;
create schema if not exists storage;
create schema if not exists extensions;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique
);

-- Supabase sets request.jwt.claims per request; auth.uid() reads the subject.
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create or replace function auth.role() returns text
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon');
$$;

-- storage.objects, for the bucket policies in 0004/0006/0012.
create table if not exists storage.buckets (
  id text primary key,
  name text,
  public boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text,
  owner uuid,
  created_at timestamptz default now()
);
alter table storage.objects enable row level security;

-- Used by the bucket policies to read the first path segment of an object
-- name ("banners/foo.jpg" -> {banners}). Same semantics as Supabase's.
create or replace function storage.foldername(p_name text)
returns text[]
language sql immutable as $$
  select string_to_array(regexp_replace(p_name, '/[^/]*$', ''), '/');
$$;

-- The three PostgREST roles.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end $$;

-- Shared test assertion. Lives here rather than in one of the .test.sql
-- files so that every test file has it regardless of which runs first.
create or replace function assert(p_condition boolean, p_what text)
returns void language plpgsql as $$
begin
  if p_condition is not true then
    raise exception 'FAILED: %', p_what;
  end if;
  raise notice '  ok  %', p_what;
end $$;

grant usage on schema public, auth, storage to anon, authenticated, service_role;
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated, service_role;
