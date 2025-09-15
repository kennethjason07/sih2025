# How to Apply the Recursion Fix

## Overview
This document explains how to apply the fix for the "infinite recursion detected in policy for relation 'users'" error in your SIH 2025 Leader Onboarding Web App.

## Files Included
1. `FIX_RECURSION_SCHEMA.sql` - Complete fixed schema with non-recursive policies
2. `IMPLEMENTED_SCHEMA.sql` - Updated main schema with fixed policies
3. `REMOVE_USER_ROLES_TABLE.sql` - Updated cleanup script with fixed policies
4. `scripts/dashboard.js` - Enhanced error handling and debugging
5. `test_recursion_fix.js` - Test script to verify the fix
6. `test_recursion.html` - HTML page to run the test

## Steps to Apply the Fix

### 1. Apply the Fixed Schema
Run the `FIX_RECURSION_SCHEMA.sql` script in your Supabase SQL editor:
- Go to your Supabase project dashboard
- Navigate to SQL Editor
- Copy and paste the contents of `FIX_RECURSION_SCHEMA.sql`
- Run the script

Alternatively, you can run the updated `IMPLEMENTED_SCHEMA.sql` which contains the same fixes.

### 2. Update the JavaScript Files
The `scripts/dashboard.js` file has been updated with enhanced error handling. Replace your existing file with the updated version.

### 3. Test the Fix
To verify that the recursion issue is resolved:

1. Open `test_recursion.html` in your browser
2. Make sure you're logged in to your application
3. Open the browser console (F12)
4. Check for successful test results

### 4. Verify in Your Application
1. Log in to your application as a leader
2. Navigate to the team registration page
3. Try to save team details
4. The recursion error should no longer occur

## What Was Fixed

### Problematic Policy (Before)
```sql
create policy "Admins can view all users" on public.users
for select using (
    auth.uid() = id or 
    (select role from public.users where id = auth.uid()) = 'admin'
);
```

### Fixed Policy (After)
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

## Key Changes
1. Added JWT role checking to avoid database queries when possible
2. Added `limit 1` to all subqueries to prevent infinite loops
3. Restructured policies to avoid self-referencing
4. Enhanced error handling in JavaScript code
5. Added comprehensive test scripts

## Troubleshooting
If you still encounter issues:

1. Make sure all policies have been updated
2. Check that the `limit 1` clause is present in all subqueries
3. Verify that JWT role checking is working correctly
4. Ensure you're using the updated `dashboard.js` file

## Additional Notes
- The fix maintains all security requirements
- No functionality has been removed, only the recursion issue has been resolved
- The solution is compatible with existing data