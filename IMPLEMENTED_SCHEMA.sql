-- Implemented Supabase Schema for Hackathon Leader Onboarding System

-- Enable Row Level Security
alter table if exists public.users enable row level security;
alter table if exists public.teams enable row level security;
alter table if exists public.team_members enable row level security;

-- Add project_type column to teams table if it doesn't exist
alter table if exists public.teams 
add column if not exists project_type character varying;

-- Create users table (if not exists from auth.users)
create table if not exists public.users (
    id uuid references auth.users on delete cascade not null primary key,
    email text unique not null,
    role text check (role in ('leader', 'admin')) default 'leader',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create teams table
create table if not exists public.teams (
    id uuid default gen_random_uuid() primary key,
    team_name character varying not null unique,
    project_type character varying,
    leader_name character varying not null,
    leader_id uuid references auth.users(id),
    stream character varying not null,
    semester character varying not null,
    category character varying not null,
    created_at timestamp without time zone default now()
);

-- Create team_members table
create table if not exists public.team_members (
    id uuid not null default gen_random_uuid() primary key,
    team_id uuid not null references public.teams(id) on delete cascade,
    position character varying not null check (position in ('Leader', 'Member')),
    full_name text not null,
    gender character varying not null check (gender in ('M', 'F')),
    stream text not null,
    semester character varying not null check (semester in ('1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th')),
    category character varying not null check (category in ('GM', 'SC', 'ST', 'OBC', 'OTHER')),
    email text not null,
    mobile text not null,
    created_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Create announcements table
create table if not exists public.announcements (
    id uuid not null default gen_random_uuid() primary key,
    title character varying not null,
    content text not null,
    created_at timestamp without time zone default now()
);

-- Create resources table
create table if not exists public.resources (
    id uuid not null default gen_random_uuid() primary key,
    title character varying not null,
    link character varying not null,
    created_at timestamp without time zone default now()
);

-- Drop all existing policies first to avoid conflicts
drop policy if exists "Users can view their own user record" on public.users;
drop policy if exists "Users can insert their own user record" on public.users;
drop policy if exists "Users can update their own user record" on public.users;
drop policy if exists "Leaders can view teams they lead" on public.teams;
drop policy if exists "Leaders can create teams they lead" on public.teams;
drop policy if exists "Leaders can update teams they lead" on public.teams;
drop policy if exists "Leaders can delete teams they lead" on public.teams;
drop policy if exists "Admins can view all users" on public.users;
drop policy if exists "Admins can view all teams" on public.teams;
drop policy if exists "Admins can view all announcements" on public.announcements;
drop policy if exists "Admins can view all resources" on public.resources;

-- Set up Row Level Security (RLS) policies - FIXED VERSION (No Recursion)

-- Users can only view their own user record
create policy "Users can view their own user record" on public.users
for select using (auth.uid() = id);

-- Users can only insert their own user record
create policy "Users can insert their own user record" on public.users
for insert with check (auth.uid() = id);

-- Users can only update their own user record
create policy "Users can update their own user record" on public.users
for update using (auth.uid() = id);

-- Leaders can view teams they lead
create policy "Leaders can view teams they lead" on public.teams
for select using (leader_id = auth.uid());

-- Drop existing policy if it exists and create the new one
drop policy if exists "Leaders can create teams they lead" on public.teams;
create policy "Leaders can create teams they lead" on public.teams
for insert with check (auth.uid() = leader_id);

-- Leaders can update teams they lead
create policy "Leaders can update teams they lead" on public.teams
for update using (leader_id = auth.uid());

-- Leaders can delete teams they lead
create policy "Leaders can delete teams they lead" on public.teams
for delete using (leader_id = auth.uid());

-- Admins can view all users (FIXED - No recursion)
create policy "Admins can view all users" on public.users
for select using (
    auth.uid() = id or 
    (auth.jwt() ->> 'role') = 'admin' or
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);

-- Admins can view all teams (FIXED - No recursion)
create policy "Admins can view all teams" on public.teams
for select using (
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);

-- Admins can view all announcements (FIXED - No recursion)
create policy "Admins can view all announcements" on public.announcements
for select using (
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);

-- Admins can view all resources (FIXED - No recursion)
create policy "Admins can view all resources" on public.resources
for select using (
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);

-- Admins can insert resources
create policy "Admins can insert resources" on public.resources
for insert with check (
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);

-- Admins can update resources
create policy "Admins can update resources" on public.resources
for update using (
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);

-- Admins can delete resources
create policy "Admins can delete resources" on public.resources
for delete using (
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);

-- Functions and triggers for automatic user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Log that the function is being called
  raise log 'handle_new_user trigger called for user: %', new.id;
  
  -- Insert into users table with default role 'leader'
  begin
    insert into public.users (id, email)
    values (new.id, new.email);
    raise log 'Successfully inserted into users table for user: %', new.id;
  exception when others then
    raise log 'Error inserting into users table for user %: %', new.id, sqlerrm;
  end;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();