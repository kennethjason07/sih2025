-- Supabase Schema for Hackathon Leader Onboarding System

-- Enable Row Level Security
alter table if exists public.users enable row level security;
alter table if exists public.teams enable row level security;
alter table if exists public.team_members enable row level security;

-- Create users table
create table if not exists public.users (
    id uuid references auth.users on delete cascade not null primary key,
    email text unique not null,
    role text check (role in ('leader', 'admin')) default 'leader',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create teams table
create table if not exists public.teams (
    id uuid default gen_random_uuid() primary key,
    project_type text check (project_type in ('Software', 'Hardware')) not null,
    team_name text unique not null,
    academic_year text not null,
    leader_id uuid references public.users(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create team_members table
create table if not exists public.team_members (
    id uuid default gen_random_uuid() primary key,
    team_id uuid references public.teams(id) on delete cascade not null,
    position text check (position in ('Leader', 'Member')) not null,
    full_name text not null,
    gender text check (gender in ('M', 'F')) not null,
    stream text not null,
    semester text check (semester in ('1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th')) not null,
    category text check (category in ('GM', 'SC', 'ST', 'OBC', 'OTHER')) not null,
    email text not null,
    mobile text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) policies

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

-- Leaders can create teams they lead
create policy "Leaders can create teams they lead" on public.teams
for insert with check (leader_id = auth.uid());

-- Leaders can update teams they lead
create policy "Leaders can update teams they lead" on public.teams
for update using (leader_id = auth.uid());

-- Leaders can delete teams they lead
create policy "Leaders can delete teams they lead" on public.teams
for delete using (leader_id = auth.uid());

-- Team members are viewable by team leaders
create policy "Team members are viewable by team leaders" on public.team_members
for select using (
    exists (
        select 1 from public.teams
        where teams.id = team_members.team_id
        and teams.leader_id = auth.uid()
    )
);

-- Team members can be created by team leaders
create policy "Team members can be created by team leaders" on public.team_members
for insert with check (
    exists (
        select 1 from public.teams
        where teams.id = team_members.team_id
        and teams.leader_id = auth.uid()
    )
);

-- Team members can be updated by team leaders
create policy "Team members can be updated by team leaders" on public.team_members
for update using (
    exists (
        select 1 from public.teams
        where teams.id = team_members.team_id
        and teams.leader_id = auth.uid()
    )
);

-- Team members can be deleted by team leaders
create policy "Team members can be deleted by team leaders" on public.team_members
for delete using (
    exists (
        select 1 from public.teams
        where teams.id = team_members.team_id
        and teams.leader_id = auth.uid()
    )
);

-- Admins can view all users
create policy "Admins can view all users" on public.users
for select using (
    exists (
        select 1 from public.users
        where users.id = auth.uid()
        and users.role = 'admin'
    )
);

-- Admins can view all teams
create policy "Admins can view all teams" on public.teams
for select using (
    exists (
        select 1 from public.users
        where users.id = auth.uid()
        and users.role = 'admin'
    )
);

-- Admins can view all team members
create policy "Admins can view all team members" on public.team_members
for select using (
    exists (
        select 1 from public.users
        where users.id = auth.uid()
        and users.role = 'admin'
    )
);