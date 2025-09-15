-- Fix recursion issue in user_roles RLS policies

-- Drop existing policies that may cause recursion
drop policy if exists "Admins can view all roles" on public.user_roles;
drop policy if exists "Admins can update any role" on public.user_roles;

-- Recreate policies avoiding recursion by not referencing user_roles within user_roles policies
-- Admins can view all roles (avoid recursion by checking users table instead)
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

-- Admins can update any role (avoid recursion by checking users table instead)
create policy "Admins can update any role" on public.user_roles
for update using (
    auth.uid() = user_id or 
    exists (
        select 1 
        from public.users u
        where u.id = auth.uid() 
        and u.role = 'admin'
    )
);