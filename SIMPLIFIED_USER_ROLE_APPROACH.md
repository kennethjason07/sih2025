# Simplified User Role Approach

## Overview
Based on the feedback, we've simplified the user role management approach by removing the separate `user_roles` table and using the `role` column in the `users` table instead.

## Changes Made

### 1. Database Schema Changes
1. Removed the `user_roles` table
2. Kept the `role` column in the `users` table with a default value of 'leader'
3. Updated all RLS policies to reference the `role` column in the `users` table
4. Simplified the `handle_new_user` trigger function to only insert into the `users` table

### 2. Updated Trigger Function
```sql
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

### 3. Updated RLS Policies
All RLS policies now reference the `role` column in the `users` table instead of the `user_roles` table:

```sql
-- Admins can view all users (using the role column in users table)
create policy "Admins can view all users" on public.users
for select using (
    auth.uid() = id or 
    'admin' = (select u.role from public.users u where u.id = auth.uid() limit 1)
);
```

### 4. JavaScript Code Updates
All JavaScript files have been updated to:
1. Remove references to the `user_roles` table
2. Query the `role` column in the `users` table instead
3. Simplify the user role checking logic

## Benefits of This Approach
1. **Simpler Schema**: No need for a separate user_roles table
2. **No Recursion Issues**: Eliminates the recursion problems we were experiencing
3. **Better Performance**: Fewer database queries needed to check user roles
4. **Easier Maintenance**: Fewer tables and relationships to manage

## Files Updated
1. [IMPLEMENTED_SCHEMA.sql](file:///c:/Users/kened/Desktop/sih2025/last%20try/IMPLEMENTED_SCHEMA.sql) - Updated schema without user_roles table
2. [REMOVE_USER_ROLES_TABLE.sql](file:///c:/Users/kened/Desktop/sih2025/last%20try/REMOVE_USER_ROLES_TABLE.sql) - Script to clean up existing database
3. [scripts/main.js](file:///c:/Users/kened/Desktop/sih2025/last%20try/scripts/main.js) - Updated to use role column
4. [scripts/dashboard.js](file:///c:/Users/kened/Desktop/sih2025/last%20try/scripts/dashboard.js) - Updated to use role column
5. [scripts/admin.js](file:///c:/Users/kened/Desktop/sih2025/last%20try/scripts/admin.js) - Updated to use role column
6. [SIMPLIFIED_USER_ROLE_APPROACH.md](file:///c:/Users/kened/Desktop/sih2025/last%20try/SIMPLIFIED_USER_ROLE_APPROACH.md) - This documentation

## Migration Steps
1. Run the [REMOVE_USER_ROLES_TABLE.sql](file:///c:/Users/kened/Desktop/sih2025/last%20try/REMOVE_USER_ROLES_TABLE.sql) script to clean up the database
2. Apply the updated schema from [IMPLEMENTED_SCHEMA.sql](file:///c:/Users/kened/Desktop/sih2025/last%20try/IMPLEMENTED_SCHEMA.sql)
3. Deploy the updated JavaScript files
4. Test the user signup and login process

## Testing
The user signup and login process should now work without any recursion issues:
1. When a user signs up, they are automatically added to the `users` table with role 'leader'
2. When a user logs in, their role is checked from the `role` column in the `users` table
3. Admin users can be manually set by updating the `role` column to 'admin'