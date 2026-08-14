-- ============================================================
-- Tradish · Configurable location-based delivery pricing
-- Run this whole file once in the Supabase SQL editor.
-- ============================================================

-- 1. Regions ---------------------------------------------------
create table if not exists public.delivery_regions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text,
  country text not null default 'Nigeria',
  active boolean not null default true,
  custom_delivery_fee_ngn integer not null default 2000 check (custom_delivery_fee_ngn >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.delivery_regions to anon, authenticated;
grant insert, update, delete on public.delivery_regions to authenticated;
grant all on public.delivery_regions to service_role;
alter table public.delivery_regions enable row level security;

drop policy if exists "Active regions are public" on public.delivery_regions;
create policy "Active regions are public" on public.delivery_regions
  for select using (active or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins manage regions" on public.delivery_regions;
create policy "Admins manage regions" on public.delivery_regions
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 2. Locations / zones ----------------------------------------
create table if not exists public.delivery_locations (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references public.delivery_regions(id) on delete cascade,
  name text not null,
  delivery_fee_ngn integer not null default 0 check (delivery_fee_ngn >= 0),
  active boolean not null default true,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists delivery_locations_region_idx on public.delivery_locations(region_id);

grant select on public.delivery_locations to anon, authenticated;
grant insert, update, delete on public.delivery_locations to authenticated;
grant all on public.delivery_locations to service_role;
alter table public.delivery_locations enable row level security;

drop policy if exists "Active locations are public" on public.delivery_locations;
create policy "Active locations are public" on public.delivery_locations
  for select using (active or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins manage locations" on public.delivery_locations;
create policy "Admins manage locations" on public.delivery_locations
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 3. Order delivery snapshot columns ---------------------------
alter table public.orders
  add column if not exists delivery_region_id uuid references public.delivery_regions(id) on delete set null,
  add column if not exists delivery_location_id uuid references public.delivery_locations(id) on delete set null,
  add column if not exists delivery_region_name text,
  add column if not exists delivery_location_name text,
  add column if not exists custom_location text,
  add column if not exists landmark text;

-- 4. Server-side pricing: the DB is the source of truth --------
create or replace function public.apply_delivery_pricing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_region public.delivery_regions%rowtype;
  v_loc    public.delivery_locations%rowtype;
  v_fee    integer;
begin
  if new.delivery_region_id is not null then
    select * into v_region from public.delivery_regions
      where id = new.delivery_region_id and active;
  end if;

  if v_region.id is null then
    select * into v_region from public.delivery_regions
      where active order by sort_order, created_at limit 1;
  end if;

  if v_region.id is null then
    raise exception 'No active delivery region is configured';
  end if;

  new.delivery_region_id   := v_region.id;
  new.delivery_region_name := v_region.name;

  if new.delivery_location_id is not null then
    select * into v_loc from public.delivery_locations
      where id = new.delivery_location_id and region_id = v_region.id and active;
    if v_loc.id is null then
      raise exception 'The selected delivery area is no longer available';
    end if;
    v_fee := v_loc.delivery_fee_ngn;
    new.delivery_location_name := v_loc.name;
    new.custom_location := null;
  else
    if coalesce(btrim(new.custom_location), '') = '' then
      raise exception 'Please select a delivery area or enter a custom location';
    end if;
    v_fee := v_region.custom_delivery_fee_ngn;
    new.delivery_location_name := 'Custom location';
  end if;

  -- Snapshot: fee is frozen on the order and never trusted from the client.
  new.delivery_fee_ngn := v_fee;
  new.total_ngn := coalesce(new.subtotal_ngn, 0) + v_fee;
  return new;
end;
$$;

drop trigger if exists orders_apply_delivery_pricing on public.orders;
create trigger orders_apply_delivery_pricing
  before insert on public.orders
  for each row execute function public.apply_delivery_pricing();

-- Prevent later edits from silently rewriting historical fees.
create or replace function public.freeze_delivery_pricing()
returns trigger language plpgsql as $$
begin
  new.delivery_fee_ngn := old.delivery_fee_ngn;
  new.total_ngn := old.total_ngn;
  return new;
end;
$$;

drop trigger if exists orders_freeze_delivery_pricing on public.orders;
create trigger orders_freeze_delivery_pricing
  before update on public.orders
  for each row execute function public.freeze_delivery_pricing();

-- 5. Seed: Damaturu (active) + inactive future regions ---------
insert into public.delivery_regions (name, state, country, active, custom_delivery_fee_ngn, sort_order)
select v.name, v.state, 'Nigeria', v.active, v.fee, v.sort_order
from (values
  ('Damaturu', 'Yobe', true,  2000, 0),
  ('Abuja',    'FCT',  false, 2500, 1),
  ('Kano',     'Kano', false, 2500, 2),
  ('Lagos',    'Lagos',false, 3000, 3)
) as v(name, state, active, fee, sort_order)
where not exists (select 1 from public.delivery_regions r where r.name = v.name);

insert into public.delivery_locations (region_id, name, delivery_fee_ngn, active, sort_order)
select r.id, v.name, v.fee, true, v.sort_order
from public.delivery_regions r
join (values
  ('Damaturu Central',   1000, 0),
  ('YSU',                 800, 1),
  ('GRA',                1200, 2),
  ('Maisandari',         1500, 3),
  ('Nayi-Nawa',          1300, 4),
  ('Sabon-Gari',         1200, 5),
  ('Pompomari',          1400, 6),
  ('Federal Low Cost',   1500, 7),
  ('Old Maiduguri Road', 1600, 8)
) as v(name, fee, sort_order) on true
where r.name = 'Damaturu'
  and not exists (
    select 1 from public.delivery_locations l where l.region_id = r.id and l.name = v.name
  );
