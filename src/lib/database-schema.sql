-- SnapShades Database Schema
-- Supabase (PostgreSQL)
-- Run this in a NEW Supabase project (separate from MTS)

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- CUSTOMERS
-- ============================================================
create table customers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PROJECTS (a customer's order session)
-- ============================================================
create table projects (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id),
  name text default 'My Project',
  status text default 'draft' check (status in ('draft', 'measuring', 'selecting', 'cart', 'checkout', 'ordered', 'processing', 'shipped', 'installed', 'completed', 'cancelled')),
  measurement_mode text check (measurement_mode in ('photo', 'manual', 'pro')),
  flow_mode text check (flow_mode in ('guided', 'express')),
  service_tier text check (service_tier in ('ship', 'install', 'design')),
  session_token text unique default encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_projects_customer on projects(customer_id);
create index idx_projects_session on projects(session_token);

-- ============================================================
-- ROOMS
-- ============================================================
create table rooms (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index idx_rooms_project on rooms(project_id);

-- ============================================================
-- WINDOWS (measurements)
-- ============================================================
create table windows (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references rooms(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  name text default 'Window',
  sort_order int default 0,
  
  -- Measurements (inches)
  top_width decimal(8,3),
  bottom_width decimal(8,3),  -- cellular shades only
  left_height decimal(8,3),
  right_height decimal(8,3),
  depth decimal(8,3),
  mount_type text default 'inside' check (mount_type in ('inside', 'outside')),
  product_options jsonb default '{}'::jsonb,
  
  -- Computed (smallest dimension used for ordering)
  order_width decimal(8,3) generated always as (
    case when bottom_width is not null and bottom_width < top_width 
    then bottom_width else top_width end
  ) stored,
  order_height decimal(8,3) generated always as (
    case when right_height < left_height 
    then right_height else left_height end
  ) stored,
  
  -- Obstructions
  obstructions text[] default '{}',
  obstruction_notes text,
  
  -- Product selection
  product_id text,          -- references catalog product ID
  variant_id text,          -- references catalog variant ID
  manufacturer text,        -- e.g., 'Norman®'
  
  -- Service tier for THIS window
  service_tier text check (service_tier in ('ship', 'install', 'design')),
  
  -- Pricing (stored at time of order)
  retail_price decimal(10,2),
  our_cost decimal(10,2),
  customer_price decimal(10,2),
  install_fee decimal(10,2) default 0,
  design_fee decimal(10,2) default 0,
  surcharges_total decimal(10,2) default 0,
  total_price decimal(10,2),
  
  -- Status
  status text default 'measuring' check (status in ('measuring', 'measured', 'product_selected', 'priced', 'ordered', 'manufacturing', 'shipped', 'installed')),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_windows_room on windows(room_id);
create index idx_windows_project on windows(project_id);

-- ============================================================
-- WINDOW PHOTOS
-- ============================================================
create table window_photos (
  id uuid primary key default uuid_generate_v4(),
  window_id uuid references windows(id) on delete cascade,
  photo_type text not null check (photo_type in ('overview', 'top_width', 'bottom_width', 'left_height', 'right_height', 'depth', 'obstruction')),
  storage_path text not null,
  ai_measurement decimal(8,3),  -- AI-extracted measurement
  ai_confidence decimal(4,2),   -- confidence 0-1
  manual_override decimal(8,3), -- customer correction
  created_at timestamptz default now()
);

create index idx_photos_window on window_photos(window_id);

-- ============================================================
-- WINDOW SURCHARGES (selected add-ons per window)
-- ============================================================
create table window_surcharges (
  id uuid primary key default uuid_generate_v4(),
  window_id uuid references windows(id) on delete cascade,
  surcharge_name text not null,
  surcharge_type text not null check (surcharge_type in ('flat', 'percent')),
  retail_amount decimal(10,2) not null,
  customer_amount decimal(10,2) not null,
  created_at timestamptz default now()
);

create index idx_surcharges_window on window_surcharges(window_id);

-- ============================================================
-- ORDERS
-- ============================================================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id),
  customer_id uuid references customers(id),
  order_number text unique not null,
  
  -- Totals
  subtotal decimal(10,2) not null,
  install_total decimal(10,2) default 0,
  design_total decimal(10,2) default 0,
  surcharges_total decimal(10,2) default 0,
  shipping_total decimal(10,2) default 0,
  tax_total decimal(10,2) default 0,
  grand_total decimal(10,2) not null,
  
  -- Payment
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  payment_status text default 'pending' check (payment_status in ('pending', 'processing', 'paid', 'failed', 'refunded', 'partial_refund')),
  
  -- Shipping
  shipping_address jsonb,
  tracking_number text,
  shipped_at timestamptz,
  estimated_delivery date,
  
  -- Status
  status text default 'pending' check (status in ('pending', 'confirmed', 'manufacturing', 'shipped', 'delivered', 'installing', 'completed', 'cancelled', 'refunded')),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_orders_customer on orders(customer_id);
create index idx_orders_project on orders(project_id);
create index idx_orders_number on orders(order_number);

-- Order number sequence
create sequence order_number_seq start with 10001;

-- ============================================================
-- INSTALLERS
-- ============================================================
create table installers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text not null,
  phone text,
  company_name text,
  
  -- Service area
  service_zips text[] default '{}',
  service_radius_miles int default 25,
  latitude decimal(10,7),
  longitude decimal(10,7),
  
  -- Verification
  insurance_verified boolean default false,
  insurance_expiry date,
  background_check boolean default false,
  onboarded boolean default false,
  
  -- Performance
  rating decimal(3,2) default 0,
  completed_jobs int default 0,
  
  -- Rates
  hourly_rate decimal(8,2),
  per_window_rate decimal(8,2),
  
  -- Status
  status text default 'pending' check (status in ('pending', 'verified', 'active', 'inactive', 'suspended')),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_installers_zips on installers using gin(service_zips);
create index idx_installers_status on installers(status);

-- ============================================================
-- INSTALLER BOOKINGS
-- ============================================================
create table installer_bookings (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id),
  installer_id uuid references installers(id),
  customer_id uuid references customers(id),
  
  booking_type text not null check (booking_type in ('measure', 'install', 'measure_install')),
  scheduled_date date,
  time_slot text, -- e.g., '9:00 AM - 11:00 AM'
  
  -- Status
  status text default 'pending' check (status in ('pending', 'confirmed', 'en_route', 'in_progress', 'completed', 'cancelled', 'no_show')),
  
  -- Communication
  customer_notes text,
  installer_notes text,
  
  -- Payment to installer
  installer_payout decimal(10,2),
  payout_status text default 'pending' check (payout_status in ('pending', 'processing', 'paid')),
  stripe_transfer_id text,
  
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_bookings_installer on installer_bookings(installer_id);
create index idx_bookings_order on installer_bookings(order_id);

-- ============================================================
-- INSTALLER AVAILABILITY
-- ============================================================
create table installer_availability (
  id uuid primary key default uuid_generate_v4(),
  installer_id uuid references installers(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Sun
  start_time time not null,
  end_time time not null,
  is_available boolean default true,
  created_at timestamptz default now()
);

create index idx_availability_installer on installer_availability(installer_id);

-- ============================================================
-- SWATCH REQUESTS
-- ============================================================
create table swatch_requests (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id),
  email text not null,
  full_name text,
  shipping_address jsonb not null,
  products text[] not null,  -- product IDs
  status text default 'pending' check (status in ('pending', 'shipped', 'delivered')),
  tracking_number text,
  shipped_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- DESIGN CONSULTATIONS
-- ============================================================
create table design_consultations (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id),
  customer_id uuid references customers(id),
  designer_name text,
  scheduled_at timestamptz,
  video_link text,
  status text default 'pending' check (status in ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  notes text,
  recommendations jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- REVIEWS
-- ============================================================
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id),
  customer_id uuid references customers(id),
  installer_id uuid references installers(id),
  rating int not null check (rating between 1 and 5),
  review_text text,
  review_type text check (review_type in ('product', 'installer', 'overall')),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table customers enable row level security;
alter table projects enable row level security;
alter table rooms enable row level security;
alter table windows enable row level security;
alter table window_photos enable row level security;
alter table orders enable row level security;
alter table installer_bookings enable row level security;
alter table swatch_requests enable row level security;

-- Customers see only their own data
create policy "customers_own_data" on customers for all using (id = auth.uid());
create policy "projects_own_data" on projects for all using (customer_id = auth.uid());
create policy "orders_own_data" on orders for all using (customer_id = auth.uid());

-- Projects accessible by session token (for anonymous users)
create policy "projects_by_session" on projects for select using (true);
create policy "rooms_by_project" on rooms for all using (
  project_id in (select id from projects where customer_id = auth.uid())
);
create policy "windows_by_project" on windows for all using (
  project_id in (select id from projects where customer_id = auth.uid())
);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Generate order number
create or replace function generate_order_number()
returns text as $$
begin
  return 'SS-' || lpad(nextval('order_number_seq')::text, 6, '0');
end;
$$ language plpgsql;

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger customers_updated before update on customers for each row execute function update_updated_at();
create trigger projects_updated before update on projects for each row execute function update_updated_at();
create trigger windows_updated before update on windows for each row execute function update_updated_at();
create trigger orders_updated before update on orders for each row execute function update_updated_at();
create trigger installers_updated before update on installers for each row execute function update_updated_at();
create trigger bookings_updated before update on installer_bookings for each row execute function update_updated_at();
