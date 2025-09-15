# Admin Login Setup Guide

## Overview
This guide explains how to set up and use the admin login functionality for your SIH 2025 Leader Onboarding Web App.

## Files Created
1. `admin-login.html` - Dedicated admin login page
2. `scripts/admin-login.js` - JavaScript for admin authentication
3. `SETUP_ADMIN_USER.sql` - SQL script to promote a user to admin
4. Updated `scripts/main.js` - Added link to admin login from main login page

## Setup Process

### 1. Create an Admin User Account
First, you need to create an admin user account through the normal signup process:

1. Go to your application's main login page
2. Click "Sign Up"
3. Create a new account with the email you want to use for admin access
4. Verify the email if required

### 2. Promote User to Admin
After creating the account, you need to promote it to admin status:

1. Open the Supabase SQL Editor in your project dashboard
2. Run the `SETUP_ADMIN_USER.sql` script
3. Replace `'ADMIN_USER_EMAIL'` with the actual email of your admin user
4. Execute the query

Example:
```sql
-- If your admin email is admin@example.com
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### 3. Access Admin Dashboard
Once the user is promoted to admin:

1. Go to `admin-login.html` (or click "Admin Login" from the main login page)
2. Enter the admin credentials
3. You will be redirected to the admin dashboard

## Security Considerations

1. **Strong Passwords**: Ensure admin accounts use strong, unique passwords
2. **Limited Access**: Only trusted individuals should have admin access
3. **Regular Audits**: Periodically review who has admin access
4. **Email Verification**: Ensure admin emails are verified

## Admin Features

The admin dashboard allows you to:
- Create and manage announcements
- Add and remove resources
- View all teams (through RLS policies)
- Manage SIH 2025-related content

## Troubleshooting

### "Access denied" Error
If you get an "Access denied" error when trying to log in as admin:
1. Verify the user exists in the `users` table
2. Check that the `role` column is set to `'admin'`
3. Ensure the email used for login matches the email in the database

### User Not Found in Users Table
If the user doesn't appear in the `users` table:
1. The trigger might not have executed properly
2. Manually insert the user record:
```sql
INSERT INTO public.users (id, email, role) 
SELECT id, 'ADMIN_USER_EMAIL', 'admin' 
FROM auth.users 
WHERE email = 'ADMIN_USER_EMAIL';
```

## Customization

You can customize the admin login page by modifying `admin-login.html` and `scripts/admin-login.js`:
- Change styling in the HTML/CSS
- Add additional security measures in the JavaScript
- Modify the SQL script for different admin setup processes