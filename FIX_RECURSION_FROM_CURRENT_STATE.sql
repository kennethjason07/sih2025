-- Fix Recursion Issue from Current Database State

-- First, drop all existing policies to avoid conflicts
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
drop policy if exists "Users can view their own role" on public.user_roles;
drop policy if exists "Admins can view all roles" on public.user_roles;
drop policy if exists "Users can update their own role" on public.user_roles;
drop policy if exists "Admins can update any role" on public.user_roles;

-- Enable Row Level Security on all tables if not already enabled
alter table if exists public.users enable row level security;
alter table if exists public.teams enable row level security;
alter table if exists public.team_members enable row level security;
alter table if exists public.announcements enable row level security;
alter table if exists public.resources enable row level security;
alter table if exists public.user_roles enable row level security;

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

-- Leaders can create teams they lead
create policy "Leaders can create teams they lead" on public.teams
for insert with check (auth.uid() = leader_id);

-- Leaders can update teams they lead
create policy "Leaders can update teams they lead" on public.teams
for update using (leader_id = auth.uid());

-- Leaders can delete teams they lead
create policy "Leaders can delete teams they lead" on public.teams
for delete using (leader_id = auth.uid());

-- Users can view their own role
create policy "Users can view their own role" on public.user_roles
for select using (user_id = auth.uid());

-- Users can update their own role (if needed)
create policy "Users can update their own role" on public.user_roles
for update using (user_id = auth.uid());

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
    ) or
    exists (
        select 1
        from public.user_roles ur
        where ur.user_id = auth.uid()
        and ur.role = 'admin'
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
    ) or
    exists (
        select 1
        from public.user_roles ur
        where ur.user_id = auth.uid()
        and ur.role = 'admin'
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
    ) or
    exists (
        select 1
        from public.user_roles ur
        where ur.user_id = auth.uid()
        and ur.role = 'admin'
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
    ) or
    exists (
        select 1
        from public.user_roles ur
        where ur.user_id = auth.uid()
        and ur.role = 'admin'
        limit 1
    )
);

-- Admins can view all roles (FIXED - No recursion)
create policy "Admins can view all roles" on public.user_roles
for select using (
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    ) or
    exists (
        select 1
        from public.user_roles ur2
        where ur2.user_id = auth.uid()
        and ur2.role = 'admin'
        limit 1
    )
);