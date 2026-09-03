-- DesiHub initial schema.
-- Money is stored as integer cents. Timestamps are timestamptz (UTC), always
-- rendered in Europe/Amsterdam by the app layer.

create extension if not exists "pgcrypto"; -- gen_random_uuid, gen_random_bytes

-- ---------------------------------------------------------------------------
-- Enums (kept in sync with packages/shared/src/constants.ts)
-- ---------------------------------------------------------------------------
create type event_category as enum (
  'concert', 'party', 'garba_dandiya', 'diwali', 'holi', 'temple',
  'cultural', 'comedy', 'food', 'family', 'workshop', 'networking'
);
create type event_status as enum ('draft', 'published', 'cancelled', 'sold_out');
create type order_status as enum ('pending', 'paid', 'failed', 'refunded', 'cancelled');
create type ticket_status as enum ('valid', 'used', 'refunded', 'transferred');
create type fee_mode as enum ('absorb', 'pass_on');
create type profile_role as enum ('attendee', 'organiser', 'admin');
create type meal_choice as enum ('veg', 'non_veg', 'jain', 'none');
create type source_kind as enum ('facebook', 'instagram', 'eventbrite', 'manual', 'other');

-- ---------------------------------------------------------------------------
-- profiles — mirrors auth.users
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  phone text,
  email text,
  city text,
  languages text[] not null default '{}',
  notification_prefs jsonb not null default '{"push":true,"email":true,"whatsapp":false}'::jsonb,
  role profile_role not null default 'attendee',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- organisers
-- ---------------------------------------------------------------------------
create table organisers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete set null,
  name text not null,
  slug text not null unique,
  logo_url text,
  bio text,
  city text,
  verified boolean not null default false,
  contact_email text,
  payout_details jsonb,
  socials jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- venues
-- ---------------------------------------------------------------------------
create table venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text not null,
  lat double precision check (lat is null or lat between -90 and 90),
  lng double precision check (lng is null or lng between -180 and 180),
  capacity integer check (capacity is null or capacity >= 0),
  accessibility_notes text
);

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table events (
  id uuid primary key default gen_random_uuid(),
  organiser_id uuid not null references organisers (id) on delete cascade,
  venue_id uuid references venues (id) on delete set null,
  title text not null,
  slug text not null unique,
  description text,
  category event_category not null,
  sub_category text,
  image_url text,
  gallery text[] not null default '{}',
  starts_at timestamptz not null,
  ends_at timestamptz,
  doors_at timestamptz,
  is_free boolean not null default false,
  min_price_cents integer check (min_price_cents is null or min_price_cents >= 0),
  max_price_cents integer check (max_price_cents is null or max_price_cents >= 0),
  currency char(3) not null default 'EUR',
  languages text[] not null default '{}',
  age_policy text,
  external_ticket_url text,
  status event_status not null default 'draft',
  featured boolean not null default false,
  family_friendly boolean not null default false,
  tags text[] not null default '{}',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  constraint gallery_max_10 check (cardinality(gallery) <= 10),
  constraint price_order check (
    min_price_cents is null or max_price_cents is null or max_price_cents >= min_price_cents
  ),
  constraint ends_after_starts check (ends_at is null or ends_at >= starts_at)
);

create index events_status_starts_idx on events (status, starts_at);
create index events_category_idx on events (category);
create index events_city_idx on events (venue_id);
create index events_organiser_idx on events (organiser_id);
create index events_featured_idx on events (featured) where featured = true;

-- ---------------------------------------------------------------------------
-- ticket_types
-- ---------------------------------------------------------------------------
create table ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  fee_mode fee_mode not null default 'pass_on',
  quantity integer not null check (quantity >= 0),
  sold integer not null default 0 check (sold >= 0),
  min_per_order integer not null default 1 check (min_per_order >= 1),
  max_per_order integer not null default 10 check (max_per_order >= 1),
  sales_start timestamptz,
  sales_end timestamptz,
  is_group boolean not null default false,
  group_size integer check (group_size is null or group_size >= 1),
  meal_option_required boolean not null default false,
  -- Hard guarantee: never oversell.
  constraint no_oversell check (sold <= quantity),
  constraint order_bounds check (max_per_order >= min_per_order)
);

create index ticket_types_event_idx on ticket_types (event_id);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  event_id uuid not null references events (id) on delete restrict,
  status order_status not null default 'pending',
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  fees_cents integer not null default 0 check (fees_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  payment_method text,
  payment_ref text,
  buyer_email text not null,
  created_at timestamptz not null default now()
);

create index orders_user_idx on orders (user_id);
create index orders_event_idx on orders (event_id);

-- ---------------------------------------------------------------------------
-- tickets
-- ---------------------------------------------------------------------------
create table tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  ticket_type_id uuid not null references ticket_types (id) on delete restrict,
  holder_name text,
  holder_email text,
  qr_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  status ticket_status not null default 'valid',
  checked_in_at timestamptz,
  checked_in_by uuid references auth.users (id) on delete set null,
  meal_choice meal_choice not null default 'none'
);

create index tickets_order_idx on tickets (order_id);
create unique index tickets_qr_idx on tickets (qr_token);

-- ---------------------------------------------------------------------------
-- saved_events / follows / subscribers / waitlist / event_sources
-- ---------------------------------------------------------------------------
create table saved_events (
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid not null references events (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create table follows (
  user_id uuid not null references auth.users (id) on delete cascade,
  organiser_id uuid not null references organisers (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, organiser_id)
);

create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  city text,
  interests event_category[] not null default '{}',
  created_at timestamptz not null default now()
);

create table waitlist (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  email text not null,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (event_id, email)
);

create table event_sources (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events (id) on delete cascade,
  kind source_kind not null,
  url text,
  raw_text text,
  imported_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
