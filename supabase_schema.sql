-- SUPABASE SCHEMAS FOR COMPLETE PROTOCOL WEB APP
-- Run this in your Supabase SQL Editor (https://database.new)

-- 1. Create a function to check if current user is admin
create or replace function public.is_admin()
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql;

-- 2. Create Profiles table if it does not exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  username text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  balance numeric not null default 0.00,
  crab_rating numeric not null default 5,
  crabs_details_open boolean not null default false,
  add_funds_open boolean not null default false,
  lottery_open boolean not null default false,
  gift_open boolean not null default false,
  account_status text not null default 'active',
  creation_date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles (always safe to run)
alter table public.profiles enable row level security;

-- Safe policy creation for profiles
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update their own profile fields" on public.profiles;
create policy "Users can update their own profile fields" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

drop policy if exists "Admin can insert profiles" on public.profiles;
create policy "Admin can insert profiles" on public.profiles
  for insert with check (public.is_admin());

-- 3. Create Cards table
create table if not exists public.cards (
  id uuid default gen_random_uuid() primary key,
  bin text not null,
  zip text not null,
  bank text not null,
  country text not null,
  state text not null,
  type text not null, -- 'Visa' | 'Mastercard' | 'Amex' | 'Discover'
  credit_debit text not null, -- 'Credit' | 'Debit'
  subtype text not null, -- 'Classic' | 'Platinum' | 'Gold' | 'Signature' | 'Business' | 'Corporate' | 'Infinite'
  exp_date text not null,
  discounted boolean not null default false,
  only_refundable boolean not null default false,
  price numeric not null,
  ssn boolean not null default false,
  dob boolean not null default false,
  mmn boolean not null default false,
  ip_address text not null,
  last_paid_amount boolean not null default false,
  driver_license boolean not null default false,
  driver_license_scan boolean not null default false,
  atm_pin boolean not null default false,
  att_pin boolean not null default false,
  full_address boolean not null default false,
  phone boolean not null default false,
  email boolean not null default false,
  email_password boolean not null default false,
  without_cvv2 boolean not null default false,
  base text not null,
  account_number boolean not null default false,
  routing_number boolean not null default false,
  card_number text,
  cvv text,
  full_name text,
  full_address_str text,
  full_phone text,
  full_ssn text,
  full_dob text,
  track1 text,
  track2 text,
  full_mmn text,
  full_atm_pin text,
  full_driver_license text,
  full_email text,
  full_email_password text,
  status text not null default 'live', -- 'live' | 'sold'
  sold_to text, -- email of buyer
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on cards
alter table public.cards enable row level security;

-- Safe policy creation for cards
drop policy if exists "Anyone authenticated can view live cards" on public.cards;
create policy "Anyone authenticated can view live cards" on public.cards
  for select using (auth.role() = 'authenticated');

drop policy if exists "Admins have full access on cards" on public.cards;
create policy "Admins have full access on cards" on public.cards
  for all using (public.is_admin());

-- 4. Create News table
create table if not exists public.news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  important boolean not null default false,
  date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on news
alter table public.news enable row level security;

-- Safe policy creation for news
drop policy if exists "Anyone authenticated can view news" on public.news;
create policy "Anyone authenticated can view news" on public.news
  for select using (auth.role() = 'authenticated');

drop policy if exists "Admins have full access on news" on public.news;
create policy "Admins have full access on news" on public.news
  for all using (public.is_admin());

-- 5. Create Wholesale Packs table
create table if not exists public.wholesale_packs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  count integer not null,
  price numeric not null,
  description text not null,
  country text not null,
  type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on wholesale packs
alter table public.wholesale_packs enable row level security;

-- Safe policy creation for wholesale packs
drop policy if exists "Anyone authenticated can view wholesale packs" on public.wholesale_packs;
create policy "Anyone authenticated can view wholesale packs" on public.wholesale_packs
  for select using (auth.role() = 'authenticated');

drop policy if exists "Admins have full access on wholesale packs" on public.wholesale_packs;
create policy "Admins have full access on wholesale packs" on public.wholesale_packs
  for all using (public.is_admin());

-- 6. Create Auctions table
create table if not exists public.auctions (
  id uuid default gen_random_uuid() primary key,
  bin text not null,
  brand text not null,
  type text not null,
  country text not null,
  state text not null,
  bank text not null,
  expiry text not null,
  starting_bid numeric not null,
  current_bid numeric not null,
  my_bid numeric not null default 0,
  bids_count integer not null default 0,
  end_time timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on auctions
alter table public.auctions enable row level security;

-- Safe policy creation for auctions
drop policy if exists "Anyone authenticated can view auctions" on public.auctions;
create policy "Anyone authenticated can view auctions" on public.auctions
  for select using (auth.role() = 'authenticated');

drop policy if exists "Authenticated can update auction bids" on public.auctions;
create policy "Authenticated can update auction bids" on public.auctions
  for update using (auth.role() = 'authenticated');

drop policy if exists "Admins have full access on auctions" on public.auctions;
create policy "Admins have full access on auctions" on public.auctions
  for all using (public.is_admin());

-- 7. Create Tickets table
create table if not exists public.tickets (
  id uuid default gen_random_uuid() primary key,
  user_email text not null,
  subject text not null,
  status text not null default 'Open' check (status in ('Open', 'Closed', 'Replied')),
  messages jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on tickets
alter table public.tickets enable row level security;

-- Safe policy creation for tickets
drop policy if exists "Users can read their own tickets" on public.tickets;
create policy "Users can read their own tickets" on public.tickets
  for select using (user_email = auth.jwt()->>'email' or public.is_admin());

drop policy if exists "Users can insert their own tickets" on public.tickets;
create policy "Users can insert their own tickets" on public.tickets
  for insert with check (user_email = auth.jwt()->>'email' or public.is_admin());

drop policy if exists "Users and admins can update tickets" on public.tickets;
create policy "Users and admins can update tickets" on public.tickets
  for update using (user_email = auth.jwt()->>'email' or public.is_admin());

-- 8. Create Orders table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_email text not null,
  bin text not null,
  bank text not null,
  price numeric not null,
  purchase_id text not null,
  test_status text not null default 'untested',
  details text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on orders
alter table public.orders enable row level security;

-- Safe policy creation for orders
drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders" on public.orders
  for select using (user_email = auth.jwt()->>'email' or public.is_admin());

drop policy if exists "Users can insert their own orders" on public.orders;
create policy "Users can insert their own orders" on public.orders
  for insert with check (user_email = auth.jwt()->>'email' or public.is_admin());

-- 9. Create Payments table
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  user_email text not null,
  amount numeric not null,
  crypto_method text not null,
  transaction_hash text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Declined')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on payments
alter table public.payments enable row level security;

-- Safe policy creation for payments
drop policy if exists "Users can view their own payments" on public.payments;
create policy "Users can view their own payments" on public.payments
  for select using (user_email = auth.jwt()->>'email' or public.is_admin());

drop policy if exists "Users can create payments" on public.payments;
create policy "Users can create payments" on public.payments
  for insert with check (user_email = auth.jwt()->>'email' or public.is_admin());

drop policy if exists "Admins can update payments" on public.payments;
create policy "Admins can update payments" on public.payments
  for update using (public.is_admin());

-- 10. Create System Settings table
create table if not exists public.system_settings (
  id text primary key, -- 'global'
  btc_address text not null,
  ltc_address text not null,
  eth_address text not null default '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  usdt_address text not null
);

-- Ensure columns exist in case table was created in an older version
alter table public.system_settings add column if not exists eth_address text not null default '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
alter table public.system_settings add column if not exists usdt_address text not null default '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

-- Enable RLS on system_settings
alter table public.system_settings enable row level security;

-- Safe policy creation for system settings
drop policy if exists "Anyone authenticated can view system settings" on public.system_settings;
create policy "Anyone authenticated can view system settings" on public.system_settings
  for select using (auth.role() = 'authenticated');

drop policy if exists "Admins can manage system settings" on public.system_settings;
create policy "Admins can manage system settings" on public.system_settings
  for all using (public.is_admin());

-- Insert initial default system settings
insert into public.system_settings (id, btc_address, ltc_address, eth_address, usdt_address)
values ('global', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'LQL9YgSTB968i99684396843968', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F')
on conflict (id) do nothing;

-- 11. Trigger to automatically create a profile when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger security definer as $$
begin
  insert into public.profiles (id, email, username, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    case when new.email = 'patrickkamande10455@gmail.com' then 'admin' else 'customer' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql;

-- Drop trigger first before recreating it
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
