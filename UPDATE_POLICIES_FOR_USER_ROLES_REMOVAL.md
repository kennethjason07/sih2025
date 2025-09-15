# Update Policies for User Roles Removal

## Problem
When trying to remove the user_roles table, we encountered an error because several RLS policies on other tables depended on the user_roles table.

## Solution
Updated the RLS policies on all tables to use the role column in the users table instead of querying the user_roles table.

## Changes Made

### 1. Updated RLS Policies
Modified all policies that previously referenced the user_roles table to instead reference the role column in the users table:

#### Before (referencing user_roles table):
```sql
-- Admins can view all users
create policy "Admins can view all users" on public.users
for select using (
    auth.uid() = id or 
    'admin' = (
        select role 
        from public.user_roles 
        where user_roles.user_id = auth.uid() 
        limit 1
    )
);
```

#### After (referencing role column in users table):
```sql
-- Admins can view all users (using the role column in users table)
create policy "Admins can view all users" on public.users
for select using (
    auth.uid() = id or 
    'admin' = (select u.role from public.users u where u.id = auth.uid() limit 1)
);
```

### 2. Updated REMOVE_USER_ROLES_TABLE.sql Script
The script now properly handles the dependency issues by:

1. First dropping the existing policies that depend on user_roles table
2. Recreating those policies to reference the role column in users table
3. Dropping policies on the user_roles table itself
4. Dropping the user_roles table with CASCADE option

### 3. Complete Script
```sql
-- Remove user_roles table and related policies

-- First, update policies on other tables to use the role column in users table instead of user_roles table
-- Drop existing policies that depend on user_roles table
drop policy if exists "Admins can view all users" on public.users;
drop policy if exists "Admins can view all teams" on public.teams;
drop policy if exists "Admins can view all announcements" on public.announcements;
drop policy if exists "Admins can view all resources" on public.resources;

-- Recreate policies using the role column in users table
-- Admins can view all users (using the role column in users table)
create policy "Admins can view all users" on public.users
for select using (
    auth.uid() = id or 
    'admin' = (select u.role from public.users u where u.id = auth.uid() limit 1)
);

-- Admins can view all teams
create policy "Admins can view all teams" on public.teams
for select using (
    'admin' = (select u.role from public.users u where u.id = auth.uid() limit 1)
);

-- Admins can view all announcements
create policy "Admins can view all announcements" on public.announcements
for select using (
    'admin' = (select u.role from public.users u where u.id = auth.uid() limit 1)
);

-- Admins can view all resources
create policy "Admins can view all resources" on public.resources
for select using (
    'admin' = (select u.role from public.users u where u.id = auth.uid() limit 1)
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
```

## Files Updated
1. [REMOVE_USER_ROLES_TABLE.sql](file:///c:/Users/kened/Desktop/sih2025/last%20try/REMOVE_USER_ROLES_TABLE.sql) - Updated script to handle dependencies properly
2. [UPDATE_POLICIES_FOR_USER_ROLES_REMOVAL.md](file:///c:/Users/kened/Desktop/sih2025/last%20try/UPDATE_POLICIES_FOR_USER_ROLES_REMOVAL.md) - This documentation

## Testing
To test the updated script:
1. Run the [REMOVE_USER_ROLES_TABLE.sql](file:///c:/Users/kened/Desktop/sih2025/last%20try/REMOVE_USER_ROLES_TABLE.sql) script in your Supabase SQL editor
2. Verify that all policies are updated correctly
3. Verify that the user_roles table is dropped successfully
4. Test the application to ensure admin functionality still works correctly