-- ============================================================
-- Convenience Hub of Maryland — Supabase Schema
-- Run this in the Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- Services
create table public.services (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  subtitle     text,
  description  text,
  price_from   text,
  pricing_details jsonb not null default '[]'::jsonb,
  sort_order   int not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Deals
create table public.deals (
  id         uuid primary key default gen_random_uuid(),
  badge      text not null,
  headline   text not null,
  detail     text,
  sort_order int not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- Business hours (one row per day)
create table public.business_hours (
  id         uuid primary key default gen_random_uuid(),
  day_name   text not null,
  day_order  int not null,
  open_time  text,
  close_time text,
  is_open    boolean not null default true,
  unique (day_order)
);

-- Contact info
create table public.contact_info (
  id         uuid primary key default gen_random_uuid(),
  key        text unique not null,
  label      text not null,
  value      text not null,
  href       text not null,
  sort_order int not null default 0
);

-- Reviews
create table public.reviews (
  id                uuid primary key default gen_random_uuid(),
  customer_name     text not null,
  rating            int not null check (rating between 1 and 5),
  body              text not null,
  service_mentioned text,
  approved          boolean not null default false,
  created_at        timestamptz not null default now()
);

-- Appointments
create table public.appointments (
  id               uuid primary key default gen_random_uuid(),
  customer_name    text not null,
  phone            text not null,
  email            text,
  service_id       uuid references public.services(id) on delete set null,
  appointment_date date not null,
  time_slot        text not null,
  status           text not null default 'pending'
                     check (status in ('pending', 'confirmed', 'cancelled')),
  notes            text,
  created_at       timestamptz not null default now()
);

-- Weekly availability (recurring slots by day-of-week)
create table public.availability (
  id           uuid primary key default gen_random_uuid(),
  day_of_week  int not null check (day_of_week between 0 and 6),
  time_slot    text not null,
  is_available boolean not null default true,
  unique (day_of_week, time_slot)
);

-- Blocked dates (specific dates with no appointments)
create table public.blocked_dates (
  id           uuid primary key default gen_random_uuid(),
  blocked_date date unique not null,
  reason       text
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.services      enable row level security;
alter table public.deals         enable row level security;
alter table public.business_hours enable row level security;
alter table public.contact_info  enable row level security;
alter table public.reviews       enable row level security;
alter table public.appointments  enable row level security;
alter table public.availability  enable row level security;
alter table public.blocked_dates enable row level security;

-- Public read policies
create policy "Public can read active services"
  on public.services for select using (active = true);

create policy "Public can read active deals"
  on public.deals for select using (active = true);

create policy "Public can read business hours"
  on public.business_hours for select using (true);

create policy "Public can read contact info"
  on public.contact_info for select using (true);

create policy "Public can read approved reviews"
  on public.reviews for select using (approved = true);

create policy "Public can read availability"
  on public.availability for select using (true);

create policy "Public can read blocked dates"
  on public.blocked_dates for select using (true);

-- Public can submit reviews (pending approval) and appointments
create policy "Public can submit reviews"
  on public.reviews for insert with check (approved = false);

create policy "Public can submit appointments"
  on public.appointments for insert with check (status = 'pending');

-- Authenticated (admin) full access
create policy "Admin full access to services"
  on public.services for all using (auth.role() = 'authenticated');

create policy "Admin full access to deals"
  on public.deals for all using (auth.role() = 'authenticated');

create policy "Admin full access to business hours"
  on public.business_hours for all using (auth.role() = 'authenticated');

create policy "Admin full access to contact info"
  on public.contact_info for all using (auth.role() = 'authenticated');

create policy "Admin full access to reviews"
  on public.reviews for all using (auth.role() = 'authenticated');

create policy "Admin full access to appointments"
  on public.appointments for all using (auth.role() = 'authenticated');

create policy "Admin full access to availability"
  on public.availability for all using (auth.role() = 'authenticated');

create policy "Admin full access to blocked dates"
  on public.blocked_dates for all using (auth.role() = 'authenticated');
