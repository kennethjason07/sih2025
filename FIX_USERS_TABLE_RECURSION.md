# Fix Users Table Recursion Issue

## Problem
Encountered "infinite recursion detected in policy for relation 'users'" error when trying to save team details. This was caused by RLS policies on the users table that were creating circular references.

## Root Cause
The admin policies were querying the users table within the users table policies, creating a circular reference that led to infinite recursion.

## Solution
Updated the RLS policies to avoid recursion by using `exists` with `limit 1` instead of direct subqueries that could cause circular references.

## Changes Made

### 1. Updated Admin Policies
Modified all admin policies to use `exists` with `limit 1` to avoid recursion:

#### Before (causing recursion):
```sql
-- Admins can view all users
create policy "Admins can view all users" on public.users
for select using (
    auth.uid() = id or 
    'admin' = (select u.role from public.users u where u.id = auth.uid() limit 1)
);
```

#### After (avoiding recursion):
```sql
-- Admins can view all users (simplified approach to avoid recursion)
create policy "Admins can view all users" on public.users
for select using (
    auth.uid() = id or 
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);
```

### 2. Applied to All Affected Policies
Updated the same pattern for all policies that reference the users table:
- Admins can view all users
- Admins can view all teams
- Admins can view all announcements
- Admins can view all resources

### 3. Complete Updated Policies
```sql
-- Admins can view all users (simplified approach to avoid recursion)
create policy "Admins can view all users" on public.users
for select using (
    auth.uid() = id or 
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);

-- Admins can view all teams
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

-- Admins can view all announcements
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

-- Admins can view all resources
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
```

## Files Updated
1. [IMPLEMENTED_SCHEMA.sql](file:///c:/Users/kened/Desktop/sih2025/last%20try/IMPLEMENTED_SCHEMA.sql) - Updated users table policies
2. [REMOVE_USER_ROLES_TABLE.sql](file:///c:/Users/kened/Desktop/sih2025/last%20try/REMOVE_USER_ROLES_TABLE.sql) - Updated policies in cleanup script
3. [FIX_USERS_TABLE_RECURSION.md](file:///c:/Users/kened/Desktop/sih2025/last%20try/FIX_USERS_TABLE_RECURSION.md) - This documentation

## Testing
To test the fix:
1. Apply the updated policies to your database
2. Try saving team details again
3. Verify that the recursion error no longer occurs
4. Ensure that admin functionality still works correctly

## Additional Notes
This fix follows the same pattern we used previously to resolve recursion issues with the user_roles table. The key is to use `exists` with `limit 1` instead of direct subqueries that can cause circular references in RLS policies.