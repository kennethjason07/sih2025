-- Remove user_roles table and related policies

-- First, update policies on other tables to use the role column in users table instead of user_roles table
-- Drop existing policies that depend on user_roles table
drop policy if exists "Admins can view all users" on public.users;
drop policy if exists "Admins can view all teams" on public.teams;
drop policy if exists "Admins can view all announcements" on public.announcements;
drop policy if exists "Admins can view all resources" on public.resources;

-- Recreate policies using the role column in users table (avoiding recursion)
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

-- Drop policies on user_roles table
drop policy if exists "Users can view their own role" on public.user_roles;
drop policy if exists "Admins can view all roles" on public.user_roles;
drop policy if exists "Users can update their own role" on public.user_roles;
drop policy if exists "Admins can update any role" on public.user_roles;

-- Drop user_roles table with cascade to remove dependent objects
drop table if exists public.user_roles cascade;

-- Update the handle_new_user function to not insert into user_roles table
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