-- Add missing RLS policies for user_roles table

-- Enable RLS on user_roles table (if not already enabled)
alter table if exists public.user_roles enable row level security;

-- Users can only view their own role
create policy "Users can view their own role" on public.user_roles
for select using (auth.uid() = user_id);

-- Admins can view all roles (avoid recursion by not checking user_roles within user_roles policies)
create policy "Admins can view all roles" on public.user_roles
for select using (
    auth.uid() = user_id or 
    exists (
        select 1 
        from public.users u
        where u.id = auth.uid() 
        and u.role = 'admin'
    )
);

-- Note: The handle_new_user function runs with security definer privileges
-- so it can insert records without needing an explicit insert policy