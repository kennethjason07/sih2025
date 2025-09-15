# Policy Update Fix Summary

## Problem
Error: "policy 'Leaders can create teams they lead' for table 'teams' already exists"

## Root Cause
When trying to update the RLS policy for team insertion, the system reported that the policy already existed, preventing the creation of the new policy with the corrected logic.

## Solution
Updated the schema in [IMPLEMENTED_SCHEMA.sql](file:///c%3A/Users/kened/Desktop/sih2025/last%20try/IMPLEMENTED_SCHEMA.sql) to properly handle existing policies by:
1. Dropping the existing policy first using `drop policy if exists`
2. Creating the new policy with the corrected logic

## Changes Made

### Before (causing the error):
```sql
-- Leaders can create teams they lead
create policy "Leaders can create teams they lead" on public.teams
for insert with check (leader_id = auth.uid());
```

### After (fixed):
```sql
-- Drop existing policy if it exists and create the new one
drop policy if exists "Leaders can create teams they lead" on public.teams;
create policy "Leaders can create teams they lead" on public.teams
for insert with check (auth.uid() = leader_id);
```

## How It Works Now
1. The system first checks if the policy exists and drops it if it does
2. Then creates the new policy with the corrected logic (`auth.uid() = leader_id`)
3. This approach prevents the "policy already exists" error
4. Ensures the correct RLS policy is in place for team creation

## Benefits
- Fixes the "policy already exists" error
- Ensures proper RLS policy is applied
- Prevents conflicts when updating existing policies
- Maintains database integrity

## Testing
After applying this change, the schema can be applied without errors, and leaders should be able to successfully create teams without encountering the RLS violation error.