-- Complete Supabase Schema for Hackathon Leader Onboarding System

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type user_role as enum ('leader', 'admin');
create type project_type as enum ('Software', 'Hardware');
create type member_position as enum ('Leader', 'Member');
create type gender as enum ('M', 'F');
create type semester as enum ('1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th');
create type category as enum ('GM', 'SC', 'ST', 'OBC', 'OTHER');

-- Create users table
create table if not exists public.users (
    id uuid references auth.users on delete cascade not null primary key,
    email text unique not null,
    role user_role default 'leader',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create teams table
create table if not exists public.teams (
    id uuid default gen_random_uuid() primary key,
    project_type project_type not null,
    team_name text unique not null,
    academic_year text not null,
    leader_id uuid references public.users(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create team_members table
create table if not exists public.team_members (
    id uuid default gen_random_uuid() primary key,
    team_id uuid references public.teams(id) on delete cascade not null,
    position member_position not null,
    full_name text not null,
    gender gender not null,
    stream text not null,
    semester semester not null,
    category category not null,
    email text not null,
    mobile text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- RLS Policies for users table
create policy "Users can view their own user record" on public.users
for select using (auth.uid() = id);

create policy "Users can insert their own user record" on public.users
for insert with check (auth.uid() = id);

create policy "Users can update their own user record" on public.users
for update using (auth.uid() = id);

-- RLS Policies for teams table
create policy "Leaders can view teams they lead" on public.teams
for select using (leader_id = auth.uid());

create policy "Leaders can create teams they lead" on public.teams
for insert with check (leader_id = auth.uid());

create policy "Leaders can update teams they lead" on public.teams
for update using (leader_id = auth.uid());

create policy "Leaders can delete teams they lead" on public.teams
for delete using (leader_id = auth.uid());

-- RLS Policies for team_members table
create policy "Team members are viewable by team leaders" on public.team_members
for select using (
    exists (
        select 1 from public.teams
        where teams.id = team_members.team_id
        and teams.leader_id = auth.uid()
    )
);

create policy "Team members can be created by team leaders" on public.team_members
for insert with check (
    exists (
        select 1 from public.teams
        where teams.id = team_members.team_id
        and teams.leader_id = auth.uid()
    )
);

create policy "Team members can be updated by team leaders" on public.team_members
for update using (
    exists (
        select 1 from public.teams
        where teams.id = team_members.team_id
        and teams.leader_id = auth.uid()
    )
);

create policy "Team members can be deleted by team leaders" on public.team_members
for delete using (
    exists (
        select 1 from public.teams
        where teams.id = team_members.team_id
        and teams.leader_id = auth.uid()
    )
);

-- Admin policies
create policy "Admins can view all users" on public.users
for select using (
    exists (
        select 1 from public.users
        where users.id = auth.uid()
        and users.role = 'admin'
    )
);

create policy "Admins can view all teams" on public.teams
for select using (
    exists (
        select 1 from public.users
        where users.id = auth.uid()
        and users.role = 'admin'
    )
);

create policy "Admins can view all team members" on public.team_members
for select using (
    exists (
        select 1 from public.users
        where users.id = auth.uid()
        and users.role = 'admin'
    )
);

-- Grant permissions
grant usage on schema public to authenticated;
grant all on table public.users to authenticated;
grant all on table public.teams to authenticated;
grant all on table public.team_members to authenticated;

-- Functions and triggers for automatic user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();