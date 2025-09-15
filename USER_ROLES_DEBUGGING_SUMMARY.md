# User Roles Debugging Summary

## Issue
The user_roles table is not getting updated when users login to the application.

## Implemented Fixes
1. Added detailed logging to the `ensureUserExists` function in all authentication entry points
2. Changed from `.single()` to `.maybeSingle()` to avoid errors when records don't exist
3. Made the existence checks more explicit
4. Created a test script to manually verify insertion into user_roles table

## Debugging Steps Taken
1. Added console logging to track the flow of the `ensureUserExists` function
2. Modified the Supabase queries to use `.maybeSingle()` instead of `.single()`
3. Created a test script (`test_user_roles.js`) to manually verify the insertion process

## Next Steps for Further Debugging

### 1. Check Supabase Dashboard
- Verify if the trigger function is actually being executed
- Check the `auth.users` table to see if new users are being created
- Examine the `users` and `user_roles` tables to see their current state

### 2. Manual Database Query Test
Run these queries in the Supabase SQL editor to check the current state:
```sql
-- Check if a specific user exists in auth.users
SELECT id, email FROM auth.users WHERE email = 'test@example.com';

-- Check if the same user exists in public.users
SELECT id, email FROM public.users WHERE id = 'USER_ID_FROM_ABOVE';

-- Check if the same user exists in public.user_roles
SELECT id, user_id, role FROM public.user_roles WHERE user_id = 'USER_ID_FROM_ABOVE';
```

### 3. Test the Trigger Function Directly
```sql
-- Test the trigger function by manually inserting into auth.users
-- (This should automatically create records in public.users and public.user_roles)
INSERT INTO auth.users (id, email) 
VALUES ('test-uuid', 'test-trigger@example.com');
```

### 4. Check for RLS Policy Issues
The RLS policies might be preventing insertion:
```sql
-- Check if RLS is enabled on the tables
SELECT tablename, relname, relrowsecurity 
FROM pg_class c 
JOIN pg_namespace n ON n.oid = c.relnamespace 
WHERE n.nspname = 'public' AND tablename IN ('users', 'user_roles');

-- Temporarily disable RLS for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
-- Run your tests here
-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

### 5. Check for Constraint Violations
There might be constraint violations preventing insertion:
```sql
-- Check table structure and constraints
\d public.user_roles
\d public.users
```

## Common Issues to Look For

1. **Trigger Not Firing**: The trigger might not be attached correctly to the `auth.users` table
2. **RLS Policies**: Row Level Security policies might be preventing insertion
3. **Constraint Violations**: Foreign key or check constraints might be preventing insertion
4. **Permissions**: The function might not have the necessary permissions to insert into the tables
5. **Race Conditions**: There might be timing issues between authentication and database operations

## Files Modified for Debugging
1. `scripts/main.js` - Added detailed logging to `ensureUserExists` function
2. `scripts/dashboard.js` - Added detailed logging to `ensureUserExists` function
3. `scripts/admin.js` - Added detailed logging to `ensureUserExists` function
4. `test_user_roles.js` - Created test script for manual verification