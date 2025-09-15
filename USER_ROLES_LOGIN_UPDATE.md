# User Roles Table Update During Login

## Issue
The user requested that when users login to the application, the `user_roles` table should also be updated. Previously, the implementation only handled this during user registration through a Supabase trigger.

## Solution
Implemented a function `ensureUserExists()` that checks if a user exists in both the `users` and `user_roles` tables during login, and creates the records if they don't exist.

## Implementation Details

### Function: ensureUserExists(user)
This function performs the following steps:
1. Checks if the user exists in the `users` table
2. If not, creates a record in the `users` table with the user's ID and email
3. Checks if the user exists in the `user_roles` table
4. If not, creates a record in the `user_roles` table with the user's ID and default 'leader' role

### Files Updated
1. `scripts/main.js` - Added `ensureUserExists()` call in `handleLogin()` function
2. `scripts/dashboard.js` - Added `ensureUserExists()` call during initialization
3. `scripts/admin.js` - Added `ensureUserExists()` call during initialization

### Benefits
1. Ensures data consistency between auth.users and application tables
2. Handles cases where the registration trigger might have failed
3. Provides backward compatibility for existing users
4. Prevents errors due to missing user records

## Code Implementation

The `ensureUserExists()` function:
```javascript
async function ensureUserExists(user) {
    try {
        // Check if user exists in users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();
        
        // If user doesn't exist in users table, create the record
        if (userError || !userData) {
            const { error: insertUserError } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email
                });
            
            if (insertUserError) {
                console.error('Error creating user record:', insertUserError);
            }
        }
        
        // Check if user exists in user_roles table
        const { data: userRoleData, error: userRoleError } = await supabase
            .from('user_roles')
            .select('id')
            .eq('user_id', user.id)
            .single();
        
        // If user doesn't exist in user_roles table, create the record with default role
        if (userRoleError || !userRoleData) {
            const { error: insertRoleError } = await supabase
                .from('user_roles')
                .insert({
                    user_id: user.id,
                    role: 'leader'  // Default role
                });
            
            if (insertRoleError) {
                console.error('Error creating user role record:', insertRoleError);
            }
        }
    } catch (error) {
        console.error('Error ensuring user exists:', error);
    }
}
```

## Testing
The implementation has been tested to ensure:
1. New users are properly added to both tables during login
2. Existing users are not affected by the checks
3. Error handling works correctly
4. Role-based access control continues to function properly