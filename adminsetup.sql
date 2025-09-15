-- SQL script to promote a user to admin role
-- This script updates the role column in the users table for a specific email address

-- First, check if the user exists
SELECT id, email, role FROM users WHERE email = 'admin@example.com';

-- Update the user's role to 'admin'
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- Verify the update
SELECT id, email, role FROM users WHERE email = 'admin@example.com';

-- Alternative: If you know the user's ID instead of email, you can use:
-- UPDATE users 
-- SET role = 'admin' 
-- WHERE id = 'USER_ID_HERE';

-- To promote multiple users to admin role:
-- UPDATE users 
-- SET role = 'admin' 
-- WHERE email IN ('admin1@example.com', 'admin2@example.com', 'admin3@example.com');

-- To see all current admins:
-- SELECT id, email, role FROM users WHERE role = 'admin';