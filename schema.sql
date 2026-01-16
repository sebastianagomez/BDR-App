-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ACCOUNTS
create table accounts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  tier text check (tier in ('Tier 1', 'Tier 2')),
  portfolio text[], -- Array of strings e.g., ['Marketing Cloud', 'Commerce Cloud']
  industry text,
  notes text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CONTACTS
create table contacts (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id) on delete cascade,
  name text not null,
  title text,
  email text,
  phone text,
  linkedin_url text,
  status text check (status in ('not_contacted', 'in_cadence', 'contacted', 'meeting_booked', 'lost')) default 'not_contacted',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CADENCES
create table cadences (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TEMPLATES
create table templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text check (category in ('first_contact', 'follow_up', 'meeting_request', 'other')),
  channel text check (channel in ('email', 'whatsapp', 'linkedin')),
  subject text,
  body text not null,
  variables text[], -- Array of strings e.g. ['first_name']
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CADENCE STEPS
create table cadence_steps (
  id uuid primary key default uuid_generate_v4(),
  cadence_id uuid references cadences(id) on delete cascade,
  step_number integer not null,
  day_offset integer not null,
  action_type text check (action_type in ('call', 'email', 'whatsapp', 'linkedin_message', 'linkedin_connection')),
  title text not null,
  description text,
  template_id uuid references templates(id) on delete set null,
  unique(cadence_id, step_number)
);

-- CONTACT CADENCES (Join table for tracking progress)
create table contact_cadences (
  id uuid primary key default uuid_generate_v4(),
  contact_id uuid references contacts(id) on delete cascade,
  cadence_id uuid references cadences(id) on delete cascade,
  current_step integer default 1,
  status text check (status in ('active', 'paused', 'completed', 'stopped')) default 'active',
  start_date date default CURRENT_DATE,
  last_action_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DAILY TASKS
create table daily_tasks (
  id uuid primary key default uuid_generate_v4(),
  contact_cadence_id uuid references contact_cadences(id) on delete cascade,
  step_id uuid references cadence_steps(id) on delete cascade,
  due_date date not null,
  status text check (status in ('pending', 'completed', 'skipped', 'postponed')) default 'pending',
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LINKEDIN POSTS
create table linkedin_posts (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  category text, 
  status text check (status in ('draft', 'scheduled', 'posted')) default 'draft',
  scheduled_date date,
  posted_date date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Simplified for MVP - assuming single user for now or handled via app)
alter table accounts enable row level security;
alter table contacts enable row level security;
alter table cadences enable row level security;
alter table cadence_steps enable row level security;
alter table contact_cadences enable row level security;
alter table daily_tasks enable row level security;
alter table templates enable row level security;
alter table linkedin_posts enable row level security;

-- Open access policy for MVP (Modify this for production!)
create policy "Allow all operations for anon" on accounts for all using (true) with check (true);
create policy "Allow all operations for anon" on contacts for all using (true) with check (true);
create policy "Allow all operations for anon" on cadences for all using (true) with check (true);
create policy "Allow all operations for anon" on cadence_steps for all using (true) with check (true);
create policy "Allow all operations for anon" on contact_cadences for all using (true) with check (true);
create policy "Allow all operations for anon" on daily_tasks for all using (true) with check (true);
create policy "Allow all operations for anon" on templates for all using (true) with check (true);
create policy "Allow all operations for anon" on linkedin_posts for all using (true) with check (true);
