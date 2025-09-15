-- Script to set up an admin user
-- Run this script after creating your admin user account through the signup process

-- First, you need to create an admin user through the normal signup process
-- Then, run this script to promote that user to admin

-- Replace 'ADMIN_USER_EMAIL' with the actual email of the user you want to make admin
-- For example, if your admin email is 'admin@example.com', replace 'ADMIN_USER_EMAIL' with 'admin@example.com'

-- Update the user's role to 'admin' in the users table
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'ADMIN_USER_EMAIL';

-- If the user doesn't exist in the users table yet, you can insert them directly:
-- INSERT INTO public.users (id, email, role) 
-- SELECT id, 'ADMIN_USER_EMAIL', 'admin' 
-- FROM auth.users 
-- WHERE email = 'ADMIN_USER_EMAIL'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Example with a specific email (uncomment and modify as needed):
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE email = 'admin@example.com';