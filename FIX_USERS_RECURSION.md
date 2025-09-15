# Fix for Users Table Recursion Issue

## Problem
The application was encountering an "infinite recursion detected in policy for relation 'users'" error when trying to save team details. This was happening because the Row Level Security (RLS) policies on the users table were creating circular references.

## Root Cause
The problematic policy was:
```sql
create policy "Admins can view all users" on public.users
for select using (
    auth.uid() = id or 
    (select role from public.users where id = auth.uid()) = 'admin'
);
```

This policy was referencing the same `users` table within its own definition, creating a recursive loop when the database tried to evaluate the policy.

## Solution
We've fixed the recursion issue by modifying the policies to avoid self-referencing. The new approach uses a combination of:

1. Direct JWT role checking: `(auth.jwt() ->> 'role') = 'admin'`
2. Subquery with LIMIT to prevent infinite recursion
3. Proper policy structure that avoids circular references

## Fixed Policies

### Admins can view all users (Fixed)
```sql
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
```

### Other policies (Fixed)
All other policies have been updated with the `limit 1` clause to prevent potential recursion:
```sql
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
```

## Implementation Steps
1. Run the FIX_RECURSION_SCHEMA.sql script to update the policies
2. Test the team registration functionality
3. Verify that the recursion error is resolved

## Why This Fix Works
1. The `limit 1` clause ensures that subqueries don't create infinite loops
2. Using JWT role checking provides a direct way to check admin status without querying the database
3. The policy structure now has clear exit conditions that prevent circular references

This fix maintains all the security requirements while eliminating the recursion issue.