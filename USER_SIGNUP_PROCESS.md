# User Signup and Role Assignment Process

## Overview
When a user signs up for the Hackathon Leader Onboarding Web App, both the `users` and `user_roles` tables should be automatically updated with the appropriate records. This document explains how this process works.

## Process Flow

### 1. User Signup
1. User fills out the signup form with email and password
2. The application calls `supabase.auth.signUp()` to create the user account
3. Supabase Auth creates the user account in the `auth.users` table

### 2. Automatic Record Creation (Trigger)
1. When a user is created in `auth.users`, the `on_auth_user_created` trigger fires
2. This trigger executes the `handle_new_user()` function
3. The function creates two records:
   - A record in the `users` table with the user's ID and email
   - A record in the `user_roles` table with the user's ID and default role 'leader'

### 3. Verification
1. The application waits for the trigger to execute
2. The application checks if both records were created successfully
3. If records are missing, the application creates them manually as a fallback

## Database Schema

### Tables Involved
1. `auth.users` - Supabase Auth table (managed by Supabase)
2. `public.users` - Application users table
3. `public.user_roles` - User roles table

### Trigger Function
```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert into users table
  insert into public.users (id, email)
  values (new.id, new.email);
  
  -- Insert default role into user_roles table
  insert into public.user_roles (user_id, role)
  values (new.id, 'leader');
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## JavaScript Implementation

### Handle Signup Function
```javascript
async function handleSignup(e) {
    e.preventDefault();
    
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    console.log('Attempting to sign up user:', email);
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });
    
    if (error) {
        console.error('Signup failed:', error);
        alert('Signup failed: ' + error.message);
        return;
    }
    
    console.log('Signup response:', data);
    
    if (data.user) {
        alert('Signup successful! Please check your email for verification.');
        // After signup, let's check if the trigger worked
        setTimeout(async () => {
            console.log('Checking if user records were created...');
            await checkUserRecords(data.user.id, email);
        }, 3000); // Increased timeout to give more time for trigger to execute
        showAuthForm();
    }
}
```

### Verification Function
```javascript
async function checkUserRecords(userId, userEmail) {
    try {
        console.log('Checking user records for user ID:', userId);
        
        // Check users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        console.log('Users table record:', userData, userError);
        
        // Check user_roles table
        const { data: userRoleData, error: userRoleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', userId);
        
        console.log('User roles table records:', userRoleData, userRoleError);
        
        // If either record is missing, try to create them manually
        if (!userData || userError) {
            console.log('User record missing, attempting to create manually...');
            await createMissingUserRecord(userId, userEmail);
        }
        
        if (!userRoleData || userRoleData.length === 0 || userRoleError) {
            console.log('User role record missing, attempting to create manually...');
            await createMissingUserRoleRecord(userId);
        }
        
    } catch (error) {
        console.error('Error checking user records:', error);
    }
}
```

## Troubleshooting

### Common Issues
1. **Trigger not firing**: Check if the trigger is properly defined in the database
2. **RLS blocking inserts**: Ensure proper RLS policies are in place
3. **Recursion errors**: Make sure policies don't create circular references
4. **Timing issues**: Increase timeout for trigger execution

### Verification Steps
1. Sign up a new user
2. Check browser console for logs
3. Verify records in both `users` and `user_roles` tables
4. If records are missing, check for errors in the console

## Testing
To test the signup process:
1. Run the application
2. Navigate to the signup page
3. Fill out the form with a new email and password
4. Check the browser console for verification messages
5. Verify records are created in the database